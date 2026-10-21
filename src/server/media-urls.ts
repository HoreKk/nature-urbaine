import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Railway buckets are private and the CMS answers with an uncacheable presigned 302 per
// request, so the website signs URLs itself, pinned to the UTC day so browsers can cache them.

// Accepts absolute URLs in case Payload's `serverURL` is ever set; Payload 4
// appends `?prefix=<prefix>` to every storage URL.
const UPLOAD_PATH =
	/^(?:https?:\/\/[^/]+)?\/api\/(pictures|media)\/file\/([^?#]+)(?:\?[^#]*)?$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const SEVEN_DAYS_S = 7 * 24 * 60 * 60;
// Payload results are acyclic JSON a handful of levels deep; the cap only
// guards against pathological input.
const MAX_DEPTH = 32;

type BucketConfig = {
	bucket: string;
	endpoint: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
};

function readBucketConfig(): BucketConfig | null {
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

let client: S3Client | null = null;
let clientConfigKey = '';

function getClient(config: BucketConfig): S3Client {
	const key = [
		config.endpoint,
		config.bucket,
		config.region,
		config.accessKeyId,
		config.secretAccessKey,
	].join('|');
	if (!client || clientConfigKey !== key) {
		client = new S3Client({
			endpoint: config.endpoint,
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
			// Same addressing as the CMS `s3Storage` config.
			forcePathStyle: true,
		});
		clientConfigKey = key;
	}
	return client;
}

let cacheDay = -1;
let signedUrlCache = new Map<string, Promise<string>>();

function startOfUtcDay(now: number): number {
	return now - (now % DAY_MS);
}

export function signUploadUrl(
	objectKey: string,
	now = Date.now(),
): Promise<string> | null {
	const config = readBucketConfig();
	if (!config) return null;

	const day = startOfUtcDay(now);
	if (day !== cacheDay) {
		cacheDay = day;
		signedUrlCache = new Map();
	}

	let pending = signedUrlCache.get(objectKey);
	if (!pending) {
		const command = new GetObjectCommand({
			Bucket: config.bucket,
			Key: objectKey,
			// Baked into the signature: the bucket answers with this header, so
			// browsers keep the file for the day without touching stored objects.
			ResponseCacheControl: 'public, max-age=86400',
		});
		const attempt = getSignedUrl(getClient(config), command, {
			expiresIn: SEVEN_DAYS_S,
			signingDate: new Date(day),
		});
		// Never let a transient failure poison the key for the rest of the day.
		attempt.catch(() => {
			if (signedUrlCache.get(objectKey) === attempt) {
				signedUrlCache.delete(objectKey);
			}
		});
		pending = attempt;
		signedUrlCache.set(objectKey, pending);
	}
	return pending;
}

type StorageLocation = { prefix?: unknown; _objectKey?: unknown };

const segment = (value: unknown): string =>
	typeof value === 'string' ? value.replace(/^\/+|\/+$/g, '') : '';

/**
 * Mirrors plugin-cloud-storage's read path (like `scripts/check-storage.ts`): pre-v4 rows
 * lack `_objectKey`, and old `media` rows with an empty prefix fall back to the collection slug.
 */
export function objectKeyFromPath(
	path: string,
	location: StorageLocation = {},
): string | null {
	const match = UPLOAD_PATH.exec(path);
	if (!match) return null;
	const [, pathFolder, filename = ''] = match;
	const folder =
		[segment(location.prefix), segment(location._objectKey)]
			.filter(Boolean)
			.join('/') || pathFolder;
	return `${folder}/${decodeURIComponent(filename)}`;
}

async function resolveUploadPath(
	path: string,
	location: StorageLocation,
): Promise<string> {
	const objectKey = objectKeyFromPath(path, location);
	const signed = objectKey ? signUploadUrl(objectKey) : null;
	// Without bucket credentials (local dev) Payload serves the file itself,
	// on this same origin.
	return signed ?? path;
}

/** Plain JSON objects only: a `Date`, `Buffer` or class instance is returned as is. */
const isRecord = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== 'object' || value === null) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
};

/** Payload upload docs are the only objects carrying both `filename` and `url`. */
const isUploadDoc = (value: Record<string, unknown>): boolean =>
	typeof value.filename === 'string' &&
	typeof value.url === 'string' &&
	UPLOAD_PATH.test(value.url);

async function rewriteUploadDoc(
	doc: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const next: Record<string, unknown> = { ...doc };
	for (const field of ['url', 'thumbnailURL'] as const) {
		const value = doc[field];
		if (typeof value === 'string' && UPLOAD_PATH.test(value)) {
			next[field] = await resolveUploadPath(value, doc);
		}
	}
	if (isRecord(doc.variants)) {
		const variants: Record<string, unknown> = {};
		for (const [name, variant] of Object.entries(doc.variants)) {
			if (isRecord(variant) && typeof variant.url === 'string') {
				variants[name] = {
					...variant,
					// A variant row carries its own location; older rows only the doc's.
					url: await resolveUploadPath(variant.url, {
						prefix: variant.prefix ?? doc.prefix,
						_objectKey: variant._objectKey ?? doc._objectKey,
					}),
				};
			} else {
				variants[name] = variant;
			}
		}
		next.variants = variants;
	}
	return next;
}

async function walk(value: unknown, depth: number): Promise<unknown> {
	if (depth > MAX_DEPTH) return value;
	if (Array.isArray(value)) {
		return Promise.all(value.map((item) => walk(item, depth + 1)));
	}
	if (!isRecord(value)) return value;
	if (isUploadDoc(value)) return rewriteUploadDoc(value);
	const entries = await Promise.all(
		Object.entries(value).map(
			async ([key, child]) => [key, await walk(child, depth + 1)] as const,
		),
	);
	return Object.fromEntries(entries);
}

/** Wrap every server-function result so the client never sees a CMS path. */
export async function withMediaUrls<T>(value: T): Promise<T> {
	return (await walk(value, 0)) as T;
}
