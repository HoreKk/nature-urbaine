// `/contribuer` PUTs its zip straight to the bucket, refused without a CORS rule
// for the site's origins: rerun when a domain changes. Replaces the bucket's rules.
import {
	GetBucketCorsCommand,
	PutBucketCorsCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { readS3Env } from '../storage';

const env = readS3Env();
if (!env) {
	console.error('[storage:cors] S3_* env vars must be set.');
	process.exit(2);
}

const origins = [
	process.env.WEBSITE_DOMAIN && `https://${process.env.WEBSITE_DOMAIN}`,
	process.env.RAILWAY_PUBLIC_DOMAIN &&
		`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
	!process.env.RAILWAY_ENVIRONMENT_NAME && 'http://localhost:3000',
].filter((origin): origin is string => Boolean(origin));

const s3 = new S3Client({
	endpoint: env.endpoint,
	region: env.region,
	credentials: {
		accessKeyId: env.accessKeyId,
		secretAccessKey: env.secretAccessKey,
	},
	forcePathStyle: true,
});

await s3.send(
	new PutBucketCorsCommand({
		Bucket: env.bucket,
		CORSConfiguration: {
			CORSRules: [
				{
					AllowedOrigins: origins,
					AllowedMethods: ['PUT'],
					AllowedHeaders: ['content-type'],
					MaxAgeSeconds: 3600,
				},
			],
		},
	}),
);

const { CORSRules } = await s3.send(
	new GetBucketCorsCommand({ Bucket: env.bucket }),
);
console.log(`[storage:cors] ${env.bucket}:`, JSON.stringify(CORSRules));
process.exit(0);
