import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin, StorageAdapter } from "payload";

// Upload collections stored in the bucket, each under a prefix equal to its
// slug. The website's `media-urls.ts` and `scripts/check-storage.ts` rely on
// this layout.
export const storageCollections = ["media", "pictures"] as const;

export function readS3Env() {
	const bucket = process.env.S3_BUCKET;
	const endpoint = process.env.S3_ENDPOINT;
	const accessKeyId = process.env.S3_ACCESS_KEY;
	const secretAccessKey = process.env.S3_SECRET_KEY;
	if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;
	return {
		bucket,
		endpoint,
		region: process.env.S3_REGION || "auto",
		accessKeyId,
		secretAccessKey,
	};
}

/**
 * Refuses to boot a deployed Payload instance without bucket credentials.
 *
 * Without them the S3 plugin silently falls back to the container's disk:
 * uploads succeed, the DB row points at a bucket key that was never written,
 * and the file vanishes on the next redeploy. Railway sets
 * `RAILWAY_ENVIRONMENT_NAME` on every service, so this cannot be forgotten the
 * way an opt-in flag could. `ALLOW_LOCAL_UPLOADS=true` is the explicit escape
 * hatch (e.g. a throwaway preview environment).
 */
function assertStorageConfigured(configured: boolean) {
	if (configured) return;
	if (!process.env.RAILWAY_ENVIRONMENT_NAME) return;
	if (process.env.ALLOW_LOCAL_UPLOADS === "true") return;
	throw new Error(
		`[storage] S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY and S3_SECRET_KEY must be set on Railway (environment "${process.env.RAILWAY_ENVIRONMENT_NAME}"). ` +
			"Refusing to start: uploads would be written to the container disk and lost on redeploy. " +
			"Set ALLOW_LOCAL_UPLOADS=true only if that is intended.",
	);
}

/**
 * Every upload collection must be stored in the bucket. A collection left out
 * of `storageCollections` is silently served from the container disk, which is
 * exactly how files were lost before, so this fails at boot instead.
 */
function assertUploadsCovered(slugs: string[]) {
	const uncovered = slugs.filter(
		(slug) => !(storageCollections as readonly string[]).includes(slug),
	);
	if (uncovered.length === 0) return;
	throw new Error(
		`[storage] Upload collection(s) ${uncovered.join(", ")} are not in storageCollections (packages/database/src/storage.ts). ` +
			"Their files would be written to the container disk and lost on redeploy.",
	);
}

/**
 * The one storage config shared by every Payload instance (CMS, website,
 * seed scripts), so an upload lands in the bucket whichever app handles it.
 *
 * When disabled (no S3 env locally) Payload v4 still inserts the
 * `prefix`/`_objectKey` columns, so generated migrations do not depend on
 * whether the S3 env vars happen to be set.
 */
export function storageAdapter(): StorageAdapter {
	const env = readS3Env();
	assertStorageConfigured(env !== null);

	return s3Storage({
		enabled: env !== null,
		collections: Object.fromEntries(
			storageCollections.map((slug) => [
				slug,
				{ prefix: slug, signedDownloads: true },
			]),
		),
		bucket: env?.bucket ?? "",
		config: {
			endpoint: env?.endpoint,
			region: env?.region ?? "auto",
			credentials: {
				accessKeyId: env?.accessKeyId ?? "",
				secretAccessKey: env?.secretAccessKey ?? "",
			},
			forcePathStyle: true,
		},
	});
}

/**
 * Must run as the last plugin, so it also sees upload collections added by
 * any other plugin.
 */
export const storageCoverageGuard: Plugin = (config) => {
	assertUploadsCovered(
		(config.collections ?? [])
			.filter((collection) => Boolean(collection.upload))
			.map((collection) => collection.slug),
	);
	return config;
};
