/**
 * Exits 1 on any missing object, so it can run as a Railway cron / pre-deploy step.
 * Plain SQL (READ ONLY) + S3 HEAD instead of Payload: same answer across Payload versions.
 */
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";
import { readS3Env, storageCollections } from "../storage";

type Job = {
	collection: string;
	id: number;
	key: string;
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

// Mirrors plugin-cloud-storage (buildPrefixWithObjectKey, getFileKey); legacy
// `media` rows with `prefix: ""` are served from `media/` through the fallback.
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
	const column = (name: string) =>
		columns.includes(name) ? `"${name}"` : "null";
	// Image sizes: `sizes_<name>_*` in Payload 3, `variants_<name>_*` in 4, where
	// each variant also stores its own `prefix`/`_objectkey`.
	const variants = columns.flatMap((name) => {
		const match = /^(sizes|variants)_(.+)_filename$/.exec(name);
		return match ? [`${match[1]}_${match[2]}`] : [];
	});
	const variantSelect = variants
		.map(
			(base) =>
				`, "${base}_filename", ${column(`${base}_prefix`)} as "${base}_prefix", ${column(`${base}__objectkey`)} as "${base}__objectkey"`,
		)
		.join("");
	const { rows } = await client.query<Record<string, string | null>>(
		`select id, filename, prefix, ${column("_objectkey")} as object_key${variantSelect} from "${collection}"`,
	);

	const jobs: Job[] = [];
	for (const row of rows) {
		const id = Number(row.id);
		if (!row.filename) {
			problems.push({ collection, id, key: "", reason: "no filename" });
			continue;
		}
		if (!row.prefix) legacyEmptyPrefix++;
		const prefix = row.prefix ?? null;
		const objectKey = row.object_key ?? null;
		jobs.push({
			collection,
			id,
			key: `${folderOf(collection, prefix, objectKey)}/${row.filename}`,
		});
		for (const base of variants) {
			const file = row[`${base}_filename`];
			if (!file) continue;
			// Rows from before the upgrade have no per-variant location.
			const folder = folderOf(
				collection,
				row[`${base}_prefix`] ?? prefix,
				row[`${base}__objectkey`] ?? objectKey,
			);
			jobs.push({ collection, id, key: `${folder}/${file}` });
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
