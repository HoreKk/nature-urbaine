/**
 * Adds the uncropped `medium` / `large` WebP variants (image-variants.ts) to
 * `pictures` rows uploaded before they existed — in production, all ~19k.
 * Without them the website falls back to the multi-megabyte original.
 *
 *   pnpm storage:variants:backfill                     # dry run: counts only
 *   BACKFILL_WRITE=1 pnpm storage:variants:backfill    # write
 *   BACKFILL_REPORT=639 BACKFILL_LIMIT=50 ...          # narrow the run
 *
 * Additive only. For each row it reads the stored original, writes the
 * missing variants next to it (`<folder>/<name>-<w>x<h>.webp`, suffixed
 * `-1`, `-2`… when the name is taken; never overwriting an existing key) and
 * fills only those empty `variants_<name>_*` columns. It never
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
import { backfillableVariants, pictureVariants } from "../image-variants";
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
	/** Names of the backfillable variants this row has no file for yet. */
	missing: string[];
};

// Same resolution as check-storage.ts and the website's media-urls.ts.
const folderOf = (row: Row) =>
	[row.prefix, row.object_key].filter(Boolean).join("/") || "pictures";

const missing = backfillableVariants
	.map((variant) => `variants_${variant.name}_filename is null`)
	.join(" or ");
const missingList = `array_remove(array[${backfillableVariants
	.map(
		(variant) =>
			`case when variants_${variant.name}_filename is null then '${variant.name}' end`,
	)
	.join(", ")}], null)`;
// Every column that names a stored file: a backfilled name must not be one.
const filenameColumns = [
	"filename",
	"original_filename",
	...pictureVariants.map((variant) => `variants_${variant.name}_filename`),
];

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

/** Metadata key recording which picture a backfilled object belongs to. */
const OWNER = "picture-id";

/** The object's owner, `""` when it has none, `null` when there is no object. */
async function ownerOf(key: string): Promise<string | null> {
	try {
		const head = await s3.send(
			new HeadObjectCommand({ Bucket: env!.bucket, Key: key }),
		);
		return head.Metadata?.[OWNER] ?? "";
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } })
			.$metadata?.httpStatusCode;
		if (status === 404) return null;
		throw error;
	}
}

async function referencedByAnotherRow(filename: string, id: number) {
	const { rowCount } = await db.query(
		`select 1 from pictures where id <> $1 and $2 in (${filenameColumns.map((column) => `"${column}"`).join(", ")}) limit 1`,
		[id, filename],
	);
	return (rowCount ?? 0) > 0;
}

// Keys claimed during this run, so two workers never pick the same free key.
const claimed = new Map<string, number>();
/** Claimant of a key some other picture or object already uses. */
const TAKEN = -1;

/**
 * Picks the variant's filename the way Payload's `getSafeFileName` would:
 * `<base>-<w>x<h>.<ext>`, then `-1`, `-2`… while that name is taken. Legacy
 * rows share one flat folder, so `parc.jpg` and `parc.png` would otherwise
 * both claim `parc-2048x1536.webp` and one would show the other's photo. A
 * key is reused only when this picture wrote it (earlier run, or `medium`
 * and `large` at the same size); `upload` says whether to write it.
 */
async function claimFilename(
	row: Row,
	folder: string,
	stem: string,
	extension: string,
): Promise<{ filename: string; upload: boolean }> {
	for (let attempt = 0; ; attempt++) {
		const filename = `${stem}${attempt > 0 ? `-${attempt}` : ""}.${extension}`;
		const key = `${folder}/${filename}`;
		const claimant = claimed.get(key);
		if (claimant !== undefined) {
			if (claimant === row.id) return { filename, upload: false };
			continue;
		}
		// Reserve before any await: a worker checking the same name meanwhile
		// moves on to the next suffix.
		claimed.set(key, row.id);
		const owner = await ownerOf(key);
		if (owner === String(row.id)) return { filename, upload: false };
		if (owner === null && !(await referencedByAnotherRow(filename, row.id))) {
			return { filename, upload: true };
		}
		claimed.set(key, TAKEN);
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
		if (!row.missing.includes(variant.name)) continue;
		const { data, info } = await source
			.clone()
			.resize({ width: variant.width, withoutEnlargement: true })
			.toFormat(variant.formatOptions.format, variant.formatOptions.options)
			.toBuffer({ resolveWithObject: true });
		const { filename, upload } = await claimFilename(
			row,
			folder,
			`${base}-${info.width}x${info.height}`,
			info.format,
		);
		if (upload) {
			await s3.send(
				new PutObjectCommand({
					Bucket: env!.bucket,
					Key: `${folder}/${filename}`,
					Body: data,
					ContentType: `image/${info.format}`,
					Metadata: { [OWNER]: String(row.id) },
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
		`select id, filename, prefix, _objectkey as object_key, ${missingList} as missing from pictures
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
