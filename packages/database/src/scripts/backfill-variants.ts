/**
 * Adds the uncropped `medium` / `large` WebP variants (image-variants.ts) to
 * `pictures` rows uploaded before they existed — in production, all ~19k.
 * Without them the website falls back to the multi-megabyte original.
 *
 *   pnpm storage:variants:backfill                     # dry run: counts only
 *   BACKFILL_WRITE=1 pnpm storage:variants:backfill    # write
 *   BACKFILL_REPORT=639 BACKFILL_LIMIT=50 ...          # narrow the run
 *
 * Additive only. For each row it reads the stored original, writes new
 * objects next to it (`<folder>/<name>-<w>x<h>.webp`, never overwriting an
 * existing key) and fills the empty `variants_<name>_*` columns. It never
 * touches the original, the thumbnail or any other column, so a failed or
 * interrupted run leaves every page working; rerunning resumes where it
 * stopped. Plain SQL + S3 like `check-storage.ts`, so `storage:check` covers
 * the new objects right after.
 *
 * Files are produced exactly as Payload's Sharp transformer would on upload:
 * EXIF rotation, `resize({ width, withoutEnlargement })`, then the variant's
 * `formatOptions`.
 */
import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import pg from "pg";
import sharp from "sharp";
import { backfillableVariants } from "../image-variants";
import { readS3Env } from "../storage";

const write = process.env.BACKFILL_WRITE === "1";
const reportId = process.env.BACKFILL_REPORT
	? Number(process.env.BACKFILL_REPORT)
	: null;
const limit = process.env.BACKFILL_LIMIT
	? Number(process.env.BACKFILL_LIMIT)
	: null;
// Each worker holds one decoded original (~48 MB for 4000×3000).
const concurrency = Number(process.env.BACKFILL_CONCURRENCY ?? 2);

const env = readS3Env();
if (!env || !process.env.DATABASE_URL) {
	console.error("[variants] DATABASE_URL and S3_* env vars must be set.");
	process.exit(2);
}

const s3 = new S3Client({
	endpoint: env.endpoint,
	region: env.region,
	forcePathStyle: true,
	credentials: {
		accessKeyId: env.accessKeyId,
		secretAccessKey: env.secretAccessKey,
	},
});

const db = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	max: concurrency + 1,
});

type Row = {
	id: number;
	filename: string;
	prefix: string | null;
	object_key: string | null;
};

// Same resolution as check-storage.ts and the website's media-urls.ts.
const folderOf = (row: Row) =>
	[row.prefix, row.object_key].filter(Boolean).join("/") || "pictures";

const missing = backfillableVariants
	.map((variant) => `variants_${variant.name}_filename is null`)
	.join(" or ");

const params: unknown[] = [];
let where = `filename is not null and mime_type like 'image/%' and mime_type <> 'image/svg+xml' and (${missing})`;
if (reportId !== null) {
	params.push(reportId);
	where += ` and report_id = $${params.length}`;
}

const total = Number(
	(
		await db.query<{ count: string }>(
			`select count(*) from pictures where ${where}`,
			params,
		)
	).rows[0]!.count,
);
console.log(
	`[variants] ${total} picture(s) missing ${backfillableVariants.map((v) => v.name).join("/")}${reportId !== null ? ` in report ${reportId}` : ""}.`,
);
if (!write) {
	console.log("[variants] Dry run. Set BACKFILL_WRITE=1 to generate them.");
	await db.end();
	process.exit(0);
}

async function exists(key: string) {
	try {
		await s3.send(new HeadObjectCommand({ Bucket: env!.bucket, Key: key }));
		return true;
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } })
			.$metadata?.httpStatusCode;
		if (status === 404) return false;
		throw error;
	}
}

async function backfill(row: Row) {
	const folder = folderOf(row);
	const object = await s3.send(
		new GetObjectCommand({
			Bucket: env!.bucket,
			Key: `${folder}/${row.filename}`,
		}),
	);
	const source = sharp(
		Buffer.from(await object.Body!.transformToByteArray()),
	).rotate();
	const base = row.filename.replace(/\.[^.]+$/, "");

	const sets: string[] = [];
	const values: unknown[] = [];
	const set = (column: string, value: unknown) => {
		values.push(value);
		sets.push(`"${column}" = $${values.length}`);
	};

	for (const variant of backfillableVariants) {
		const { data, info } = await source
			.clone()
			.resize({ width: variant.width, withoutEnlargement: true })
			.toFormat(variant.formatOptions.format, variant.formatOptions.options)
			.toBuffer({ resolveWithObject: true });
		const filename = `${base}-${info.width}x${info.height}.${info.format}`;
		const key = `${folder}/${filename}`;
		// `medium` and `large` share a file when the original is small.
		if (!(await exists(key))) {
			await s3.send(
				new PutObjectCommand({
					Bucket: env!.bucket,
					Key: key,
					Body: data,
					ContentType: `image/${info.format}`,
				}),
			);
		}
		const column = `variants_${variant.name}`;
		set(`${column}_filename`, filename);
		set(`${column}_url`, `/api/pictures/file/${encodeURIComponent(filename)}`);
		set(`${column}_width`, info.width);
		set(`${column}_height`, info.height);
		set(`${column}_mime_type`, `image/${info.format}`);
		set(`${column}_filesize`, data.length);
		set(`${column}_prefix`, row.prefix);
		set(`${column}__objectkey`, row.object_key);
	}

	values.push(row.id);
	await db.query(
		`update pictures set ${sets.join(", ")} where id = $${values.length}`,
		values,
	);
}

let done = 0;
let failed = 0;
let lastId = 0;
const target = limit ?? total;
const started = Date.now();

for (;;) {
	const remaining = target - done - failed;
	if (remaining <= 0) break;
	const batchParams = [...params, lastId, Math.min(200, remaining)];
	const { rows } = await db.query<Row>(
		`select id, filename, prefix, _objectkey as object_key from pictures
		 where ${where} and id > $${batchParams.length - 1}
		 order by id limit $${batchParams.length}`,
		batchParams,
	);
	if (rows.length === 0) break;
	lastId = rows[rows.length - 1]!.id;

	const queue = [...rows];
	await Promise.all(
		Array.from({ length: concurrency }, async () => {
			for (let row = queue.shift(); row; row = queue.shift()) {
				try {
					await backfill(row);
					done++;
				} catch (error) {
					failed++;
					console.error(
						`[variants] picture ${row.id} (${folderOf(row)}/${row.filename}): ${(error as Error).message}`,
					);
				}
			}
		}),
	);
	console.log(
		`[variants] ${done} done, ${failed} failed, ${target - done - failed} left (${Math.round((Date.now() - started) / 1000)} s)`,
	);
}

await db.end();
console.log(
	`[variants] Finished: ${done} picture(s) backfilled, ${failed} failure(s).`,
);
process.exit(failed > 0 ? 1 : 0);
