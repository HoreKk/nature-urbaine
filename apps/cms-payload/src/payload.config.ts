import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPayloadConfig } from "@nature-urbaine/database/config";
import { s3Storage } from "@payloadcms/storage-s3";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const s3Enabled = Boolean(
	process.env.S3_BUCKET &&
	process.env.S3_ENDPOINT &&
	process.env.S3_ACCESS_KEY &&
	process.env.S3_SECRET_KEY,
);

export default buildPayloadConfig({
	importMapBaseDir: dirname,
	plugins: s3Enabled
		? [
				s3Storage({
					collections: {
						media: true,
					},
					bucket: process.env.S3_BUCKET as string,
					config: {
						endpoint: process.env.S3_ENDPOINT,
						region: process.env.S3_REGION,
						credentials: {
							accessKeyId: process.env.S3_ACCESS_KEY as string,
							secretAccessKey: process.env.S3_SECRET_KEY as string,
						},
						forcePathStyle: true,
					},
				}),
			]
		: [],
});
