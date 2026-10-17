/**
 * Read-only integrity check: every `media` / `pictures` row (and each of its
 * generated sizes) must have its object in the bucket, at the key the CMS
 * resolves and at the key the website signs.
 *
 * Catches the failure where uploads were written to a container disk instead
 * of S3 (missing env vars, a collection without the storage plugin): the row
 * exists, the link is dead. Exits 1 when anything is missing, so it can run as
 * a Railway cron / pre-deploy step and surface as a failed run.
 *
 * Deliberately independent of Payload: plain SQL inside a READ ONLY
 * transaction plus S3 HEAD requests. It gives the same answer before and after
 * a migration, on any Payload version, and cannot write anywhere.
 *
 *   pnpm storage:check            # uses S3_* and DATABASE_URL from the env
 */
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";
import { readS3Env, storageCollections } from "../storage";

type Job = {
	collection: string;
	id: number;
	key: string;
	websiteKey: string;
};

type Problem = {
	collection: string;
	id: number;
	key: string;
	reason: string;
};

const env = readS3Env();
if (!env || !process.env.DATABASE_URL) {
	console.error("[storage:check] DATABASE_URL and S3_* env vars must be set.");
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

async function exists(key: string): Promise<boolean> {
	for (let attempt = 1; ; attempt++) {
		try {
			await s3.send(new HeadObjectCommand({ Bucket: env!.bucket, Key: key }));
			return true;
		} catch (error) {
			const status = (error as { $metadata?: { httpStatusCode?: number } })
				.$metadata?.httpStatusCode;
			if (status === 404) return false;
			if (attempt === 3) throw error;
		}
	}
}

// Mirrors plugin-cloud-storage: `prefix/_objectKey` (buildPrefixWithObjectKey),
// and an empty result falls back to the collection prefix (getFileKey). Rows
// uploaded before `media` had a prefix are stored with `prefix: ""` and are
// served from `media/` through that fallback.
const folderOf = (
	collection: string,
	prefix: string | null,
	objectKey: string | null,
) => [prefix, objectKey].filter(Boolean).join("/") || collection;

const problems: Problem[] = [];
let checked = 0;
let legacyEmptyPrefix = 0;

async function checkAll(jobs: Job[]) {
	let next = 0;
	const worker = async () => {
		for (let job = jobs[next++]; job; job = jobs[next++]) {
			checked++;
			if (!(await exists(job.key))) {
				problems.push({ ...job, reason: "object missing" });
			} else if (
				job.websiteKey !== job.key &&
				!(await exists(job.websiteKey))
			) {
				problems.push({
					...job,
					key: job.websiteKey,
					reason: "missing at the key the website signs",
				});
			}
		}
	};
	await Promise.all(Array.from({ length: 48 }, worker));
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("BEGIN READ ONLY");

for (const collection of storageCollections) {
	const columns = (
		await client.query<{ column_name: string }>(
			"select column_name from information_schema.columns where table_schema = 'public' and table_name = $1",
			[collection],
		)
	).rows.map((row) => row.column_name);
	// `_objectkey` only exists once the Payload 3.90 migration has run.
	const objectKey = columns.includes("_objectkey") ? "_objectkey" : "null";
	const sizeColumns = columns.filter((name) =>
		/^sizes_.+_filename$/.test(name),
	);
	const { rows } = await client.query<Record<string, string | null>>(
		`select id, filename, prefix, ${objectKey} as object_key${sizeColumns.map((name) => `, "${name}"`).join("")} from "${collection}"`,
	);

	const jobs: Job[] = [];
	for (const row of rows) {
		const id = Number(row.id);
		if (!row.filename) {
			problems.push({ collection, id, key: "", reason: "no filename" });
			continue;
		}
		if (!row.prefix) legacyEmptyPrefix++;
		const folder = folderOf(
			collection,
			row.prefix ?? null,
			row.object_key ?? null,
		);
		const files = [
			row.filename,
			...sizeColumns.map((name) => row[name]).filter(Boolean),
		] as string[];
		for (const file of files) {
			// The website signs `<collection>/<file>` directly
			// (apps/website/src/server/media-urls.ts).
			jobs.push({
				collection,
				id,
				key: `${folder}/${file}`,
				websiteKey: `${collection}/${file}`,
			});
		}
	}
	await checkAll(jobs);
}

await client.query("ROLLBACK");
await client.end();

console.log(
	`[storage:check] ${checked} objects checked in bucket "${env.bucket}".`,
);
if (legacyEmptyPrefix > 0) {
	console.log(
		`[storage:check] ${legacyEmptyPrefix} row(s) have an empty prefix and rely on the collection-prefix fallback (fine while the storage config keeps prefix = slug).`,
	);
}
if (problems.length === 0) {
	console.log("[storage:check] OK — every upload row has its file.");
	process.exit(0);
}
console.error(`[storage:check] ${problems.length} problem(s):`);
console.table(problems);
process.exit(1);
