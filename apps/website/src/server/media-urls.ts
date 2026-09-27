import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getBackendUrl } from '@/utils/backend-url';

/**
 * Rewrites Payload upload URLs (`/api/<collection>/file/<name>`) into URLs the
 * browser can fetch directly from the Railway bucket.
 *
 * Why not let the CMS do it: Railway buckets are private (no public URLs), so
 * the CMS answers each image request with a DB lookup + a freshly presigned
 * 302. Every URL is unique, so browsers never reuse their cache and the CMS
 * pays a request per image per page view. Bucket egress on Railway is free;
 * service egress is not.
 *
 * What this does instead: the website signs the object URL itself, with the
 * signing date pinned to the start of the current UTC day. The signature is
 * therefore identical for every request of the day, on every instance, which
 * makes the URL cacheable by the browser. Each URL stays valid 7 days (the
 * SigV4 maximum), so a page cached late in the day still works.
 *
 * Without bucket credentials (local dev) URLs point at the CMS as before.
 */

// Relative (`/api/...`) today; also accepts an absolute URL in case Payload's
// `serverURL` is ever set, so signing still applies.
const UPLOAD_PATH =
	/^(?:https?:\/\/[^/]+)?\/api\/(pictures|media)\/file\/([^?#]+)$/;
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

// One entry per object per UTC day; reset when the day rolls over.
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

function objectKeyFromPath(path: string): string | null {
	const match = UPLOAD_PATH.exec(path);
	if (!match) return null;
	// CMS stores each collection under a prefix equal to its slug.
	return `${match[1]}/${decodeURIComponent(match[2])}`;
}

async function resolveUploadPath(path: string): Promise<string> {
	const objectKey = objectKeyFromPath(path);
	const signed = objectKey ? signUploadUrl(objectKey) : null;
	if (signed) return signed;
	return path.startsWith('/') ? getBackendUrl(path) : path;
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
			next[field] = await resolveUploadPath(value);
		}
	}
	if (isRecord(doc.sizes)) {
		const sizes: Record<string, unknown> = {};
		for (const [name, size] of Object.entries(doc.sizes)) {
			if (isRecord(size) && typeof size.url === 'string') {
				sizes[name] = { ...size, url: await resolveUploadPath(size.url) };
			} else {
				sizes[name] = size;
			}
		}
		next.sizes = sizes;
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

/**
 * Deep-copies a server-function result, replacing every upload doc's `url`,
 * `thumbnailURL` and `sizes.*.url` with browser-fetchable URLs. Call it on the
 * value a server function returns so the client never sees a CMS path.
 */
export async function withMediaUrls<T>(value: T): Promise<T> {
	return (await walk(value, 0)) as T;
}
