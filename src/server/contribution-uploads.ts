import { randomUUID } from 'node:crypto';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getBucketClient, readBucketConfig } from './bucket';
import {
	CONTRIBUTION_MAX_ARCHIVE_BYTES,
	UPLOADS_UNAVAILABLE,
} from './contribution-contract';

// Outside every upload collection's prefix. Payload's own `clientUploads` would
// move every collection's admin uploads to the bucket too (ADR-0005).
const STAGING_PREFIX = 'contribution-uploads/';
const UPLOAD_URL_TTL_S = 10 * 60;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

// A signed URL can be PUT again after its submit: one key, one Contribution.
// In memory like the rate limiter, enough while the site runs on one instance.
const unclaimedKeys = new Map<string, number>();

/** False when `key` was never handed out, has expired, or was already submitted. */
export function claimStagingUpload(key: string, now = Date.now()): boolean {
	const expiresAt = unclaimedKeys.get(key);
	unclaimedKeys.delete(key);
	return expiresAt !== undefined && expiresAt > now;
}

function bucket() {
	const config = readBucketConfig();
	if (!config) throw new Error(UPLOADS_UNAVAILABLE);
	return { client: getBucketClient(config), name: config.bucket };
}

export async function presignStagingUpload(size: number) {
	const { client, name } = bucket();
	const key = `${STAGING_PREFIX}${randomUUID()}.zip`;
	const contentType = 'application/zip';
	const url = await getSignedUrl(
		client,
		new PutObjectCommand({
			Bucket: name,
			Key: key,
			ContentType: contentType,
			ContentLength: size,
		}),
		{ expiresIn: UPLOAD_URL_TTL_S },
	);
	const now = Date.now();
	for (const [unclaimed, expiresAt] of unclaimedKeys) {
		if (expiresAt <= now) unclaimedKeys.delete(unclaimed);
	}
	unclaimedKeys.set(key, now + UPLOAD_URL_TTL_S * 1000);
	return { key, url, contentType };
}

/** Null when the object is missing or larger than an archive may be. */
export async function readStagingUpload(
	key: string,
): Promise<Uint8Array | null> {
	const { client, name } = bucket();
	try {
		const object = await client.send(
			new GetObjectCommand({ Bucket: name, Key: key }),
		);
		if (
			!object.Body ||
			(object.ContentLength ?? 0) > CONTRIBUTION_MAX_ARCHIVE_BYTES
		) {
			return null;
		}
		return await object.Body.transformToByteArray();
	} catch (error) {
		if (error instanceof Error && error.name === 'NoSuchKey') return null;
		throw error;
	}
}

export async function deleteStagingUpload(key: string): Promise<void> {
	const { client, name } = bucket();
	await client.send(new DeleteObjectCommand({ Bucket: name, Key: key }));
}

/** Uploads never followed by a submit (closed tab, lost connection). */
export async function sweepStaleStagingUploads(now = Date.now()) {
	const { client, name } = bucket();
	const listing = await client.send(
		new ListObjectsV2Command({ Bucket: name, Prefix: STAGING_PREFIX }),
	);
	const stale = (listing.Contents ?? []).filter(
		(object) =>
			object.Key &&
			object.LastModified &&
			now - object.LastModified.getTime() > STALE_AFTER_MS,
	);
	await Promise.all(
		stale.map((object) =>
			client.send(new DeleteObjectCommand({ Bucket: name, Key: object.Key })),
		),
	);
}
