import { S3Client } from '@aws-sdk/client-s3';

export type BucketConfig = {
	bucket: string;
	endpoint: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
};

export function readBucketConfig(): BucketConfig | null {
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

export function getBucketClient(config: BucketConfig): S3Client {
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
