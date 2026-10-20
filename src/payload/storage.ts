import { s3Storage } from '@payloadcms/storage-s3';
import type { Plugin, StorageAdapter } from 'payload';

// Each collection is stored under a prefix equal to its slug; the website's
// `media-urls.ts` and `scripts/check-storage.ts` rely on this layout.
export const storageCollections = ['media', 'pictures'] as const;

export function readS3Env() {
	const bucket = process.env.S3_BUCKET;
	const endpoint = process.env.S3_ENDPOINT;
	const accessKeyId = process.env.S3_ACCESS_KEY;
	const secretAccessKey = process.env.S3_SECRET_KEY;
	if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;
	return {
		bucket,
		endpoint,
		region: process.env.S3_REGION || 'auto',
		accessKeyId,
		secretAccessKey,
	};
}

/**
 * Without credentials the S3 plugin silently falls back to the container disk and
 * files vanish on redeploy. Railway sets `RAILWAY_ENVIRONMENT_NAME` on every service.
 */
function assertStorageConfigured(configured: boolean) {
	if (configured) return;
	if (!process.env.RAILWAY_ENVIRONMENT_NAME) return;
	if (process.env.ALLOW_LOCAL_UPLOADS === 'true') return;
	throw new Error(
		`[storage] S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY and S3_SECRET_KEY must be set on Railway (environment "${process.env.RAILWAY_ENVIRONMENT_NAME}"). ` +
			'Refusing to start: uploads would be written to the container disk and lost on redeploy. ' +
			'Set ALLOW_LOCAL_UPLOADS=true only if that is intended.',
	);
}

/** A collection left out of `storageCollections` silently falls back to the container disk. */
function assertUploadsCovered(slugs: string[]) {
	const uncovered = slugs.filter(
		(slug) => !(storageCollections as readonly string[]).includes(slug),
	);
	if (uncovered.length === 0) return;
	throw new Error(
		`[storage] Upload collection(s) ${uncovered.join(', ')} are not in storageCollections (src/payload/storage.ts). ` +
			'Their files would be written to the container disk and lost on redeploy.',
	);
}

/**
 * Shared by every Payload instance (CMS, website, seeds). Even when disabled, Payload v4
 * adds the `prefix`/`_objectKey` columns, so migrations do not depend on the S3 env.
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
		bucket: env?.bucket ?? '',
		config: {
			endpoint: env?.endpoint,
			region: env?.region ?? 'auto',
			credentials: {
				accessKeyId: env?.accessKeyId ?? '',
				secretAccessKey: env?.secretAccessKey ?? '',
			},
			forcePathStyle: true,
		},
	});
}

/** Must run as the last plugin, so it also sees upload collections added by other plugins. */
export const storageCoverageGuard: Plugin = (config) => {
	assertUploadsCovered(
		(config.collections ?? [])
			.filter((collection) => Boolean(collection.upload))
			.map((collection) => collection.slug),
	);
	return config;
};
