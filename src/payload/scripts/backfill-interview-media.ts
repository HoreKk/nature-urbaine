/**
 * One-off, run by hand after the deploy that adds Interview galleries and Media variants:
 * 1. generates the `pictureVariants` every image `media` row is missing (portraits,
 *    contribution photos), in place, never overwriting an object or a column;
 * 2. copies each Interview's legacy `thumbnail` into its `relatedPictures` as a new `InterviewPicture`,
 *    skipping interviews that already have one, so a rerun is a no-op.
 * Dry run by default; `BACKFILL_WRITE=1` writes. Media rows and files are never deleted.
 */
import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getPayload } from 'payload';
import pg from 'pg';
import sharp from 'sharp';
import { pictureVariants } from '../image-variants';
import config from '../read-config';
import { readS3Env } from '../storage';

const write = process.env.BACKFILL_WRITE === '1';

const env = readS3Env();
if (!env || !process.env.DATABASE_URL) {
	console.error('[backfill] DATABASE_URL and S3_* env vars must be set.');
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

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

type MediaRow = {
	id: number;
	filename: string;
	mime_type: string;
	prefix: string | null;
	object_key: string | null;
	/** Variants this row has no file for yet. */
	missing: string[];
};

// Same resolution as check-storage.ts and the website's media-urls.ts: legacy rows
// with `prefix: ""` are served from `media/`.
const folderOf = (row: Pick<MediaRow, 'prefix' | 'object_key'>) =>
	[row.prefix, row.object_key].filter(Boolean).join('/') || 'media';

async function readOriginal(
	row: Pick<MediaRow, 'filename' | 'prefix' | 'object_key'>,
) {
	const object = await s3.send(
		new GetObjectCommand({
			Bucket: env!.bucket,
			Key: `${folderOf(row)}/${row.filename}`,
		}),
	);
	return Buffer.from(await object.Body!.transformToByteArray());
}

// --- 1. Media variants -------------------------------------------------------

const missingList = `array_remove(array[${pictureVariants
	.map(
		(variant) =>
			`case when variants_${variant.name}_filename is null then '${variant.name}' end`,
	)
	.join(', ')}], null)`;
const filenameColumns = [
	'filename',
	...pictureVariants.map((variant) => `variants_${variant.name}_filename`),
];

const { rows: mediaRows } = await db.query<MediaRow>(
	`select id, filename, mime_type, prefix, _objectkey as object_key, ${missingList} as missing
	 from media
	 where filename is not null and mime_type like 'image/%' and mime_type <> 'image/svg+xml'
	   and cardinality(${missingList}) > 0
	 order by id`,
);
console.log(`[backfill] ${mediaRows.length} media row(s) missing variants.`);

async function objectExists(key: string) {
	try {
		await s3.send(new HeadObjectCommand({ Bucket: env!.bucket, Key: key }));
		return true;
	} catch (error) {
		const status = (error as { $metadata?: { httpStatusCode?: number } })
			.$metadata?.httpStatusCode;
		if (status === 404) return false;
		throw error;
	}
}

/**
 * Suffixes `-1`, `-2`… like Payload's `getSafeFileName`: legacy rows share one flat
 * folder, so `parc.jpg` and `parc.png` would otherwise both claim `parc-1024x768.webp`.
 */
async function freeFilename(folder: string, stem: string, extension: string) {
	for (let attempt = 0; ; attempt++) {
		const filename = `${stem}${attempt > 0 ? `-${attempt}` : ''}.${extension}`;
		const { rowCount } = await db.query(
			`select 1 from media where $1 in (${filenameColumns.map((column) => `"${column}"`).join(', ')}) limit 1`,
			[filename],
		);
		if (
			(rowCount ?? 0) === 0 &&
			!(await objectExists(`${folder}/${filename}`))
		) {
			return filename;
		}
	}
}

async function backfillMediaVariants(row: MediaRow) {
	const folder = folderOf(row);
	const source = sharp(await readOriginal(row)).rotate();
	const base = row.filename.replace(/\.[^.]+$/, '');

	const sets: string[] = [];
	const values: unknown[] = [];
	const set = (column: string, value: unknown) => {
		values.push(value);
		sets.push(`"${column}" = $${values.length}`);
	};

	for (const variant of pictureVariants) {
		if (!row.missing.includes(variant.name)) continue;
		let image = source.clone().resize({
			width: variant.width,
			...('height' in variant
				? { height: variant.height, position: variant.position }
				: {}),
			withoutEnlargement: true,
		});
		if ('formatOptions' in variant && variant.formatOptions) {
			image = image.toFormat(
				variant.formatOptions.format,
				variant.formatOptions.options,
			);
		}
		const { data, info } = await image.toBuffer({ resolveWithObject: true });
		const filename = await freeFilename(
			folder,
			`${base}-${info.width}x${info.height}`,
			info.format === 'jpeg' ? 'jpg' : info.format,
		);
		await s3.send(
			new PutObjectCommand({
				Bucket: env!.bucket,
				Key: `${folder}/${filename}`,
				Body: data,
				ContentType: `image/${info.format}`,
			}),
		);
		const column = `variants_${variant.name}`;
		set(`${column}_filename`, filename);
		set(`${column}_url`, `/api/media/file/${encodeURIComponent(filename)}`);
		set(`${column}_width`, info.width);
		set(`${column}_height`, info.height);
		set(`${column}_mime_type`, `image/${info.format}`);
		set(`${column}_filesize`, data.length);
		set(`${column}_prefix`, row.prefix);
		set(`${column}__objectkey`, row.object_key);
	}

	values.push(row.id);
	await db.query(
		`update media set ${sets.join(', ')} where id = $${values.length}`,
		values,
	);
}

// --- 2. Interview thumbnails into galleries ----------------------------------

type ThumbnailRow = {
	interview_id: number;
	interview_name: string;
	alt: string;
	filename: string;
	mime_type: string;
	filesize: number | null;
	prefix: string | null;
	object_key: string | null;
};

const { rows: thumbnailRows } = await db.query<ThumbnailRow>(
	`select i.id as interview_id, i.name as interview_name, m.alt, m.filename, m.mime_type,
	        m.filesize, m.prefix, m._objectkey as object_key
	 from interviews i
	 join media m on m.id = i.thumbnail_id
	 where m.filename is not null
	   and not exists (select 1 from interview_pictures p where p.interview_id = i.id)
	 order by i.id`,
);
console.log(
	`[backfill] ${thumbnailRows.length} interview thumbnail(s) to copy into galleries.`,
);

if (!write) {
	for (const row of thumbnailRows) {
		console.log(
			`[backfill]   interview ${row.interview_id} « ${row.interview_name} » ← ${folderOf(row)}/${row.filename}`,
		);
	}
	console.log('[backfill] Dry run. Set BACKFILL_WRITE=1 to write.');
	await db.end();
	process.exit(0);
}

let failed = 0;

for (const row of mediaRows) {
	try {
		await backfillMediaVariants(row);
		console.log(
			`[backfill] media ${row.id}: ${row.missing.join('/')} generated`,
		);
	} catch (error) {
		failed++;
		console.error(
			`[backfill] media ${row.id} (${folderOf(row)}/${row.filename}): ${(error as Error).message}`,
		);
	}
}

const payload = await getPayload({ config });
for (const row of thumbnailRows) {
	try {
		const data = await readOriginal(row);
		// Payload generates the variants and orders the photo first in the empty join.
		const picture = await payload.create({
			collection: 'interview-pictures',
			overrideAccess: true,
			data: { alt: row.alt, interview: row.interview_id },
			file: {
				data,
				mimetype: row.mime_type,
				name: row.filename,
				size: data.length,
			},
		});
		console.log(
			`[backfill] interview ${row.interview_id}: thumbnail copied as picture ${picture.id}`,
		);
	} catch (error) {
		failed++;
		console.error(
			`[backfill] interview ${row.interview_id} (${folderOf(row)}/${row.filename}): ${(error as Error).message}`,
		);
	}
}

await db.end();
console.log(
	`[backfill] Finished: ${mediaRows.length} media row(s), ${thumbnailRows.length} thumbnail(s), ${failed} failure(s).`,
);
process.exit(failed > 0 ? 1 : 0);
