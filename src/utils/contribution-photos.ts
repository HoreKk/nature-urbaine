import ExifReader from 'exifreader';
import { zipSync } from 'fflate';
import { CONTRIBUTION_PICTURE_MAX_EDGE } from '@/server/contribution-contract';

const JPEG_QUALITY = 0.85;
// EXIF sits at the start of a JPEG: no need to read 20 Mo to find a date.
const EXIF_READ_BYTES = 128 * 1024;

export const PHOTO_UNREADABLE = 'PHOTO_UNREADABLE';
export const UPLOAD_FAILED = 'UPLOAD_FAILED';

/** `2024:05:12 14:20:11`, the EXIF format, read as local time. */
export function parseExifDate(value: string | undefined): Date | null {
	const match = value?.match(
		/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
	);
	if (!match) return null;
	const [year = 0, month = 1, day = 1, hours = 0, minutes = 0, seconds = 0] =
		match.slice(1).map(Number);
	const date = new Date(year, month - 1, day, hours, minutes, seconds);
	return Number.isNaN(date.getTime()) || year < 1900 ? null : date;
}

async function readShotDate(file: File): Promise<Date | null> {
	try {
		const tags = await ExifReader.load(file, { length: EXIF_READ_BYTES });
		return parseExifDate(tags.DateTimeOriginal?.description);
	} catch {
		return null;
	}
}

/**
 * Re-encodes to JPEG at most 2560 px on the long edge. This also drops every
 * metadata block, GPS position included, before the photo leaves the device.
 */
async function downscale(file: File): Promise<Uint8Array> {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		// HEIC outside Safari, RAW files, corrupted images.
		throw new Error(PHOTO_UNREADABLE, { cause: file.name });
	}

	const scale = Math.min(
		1,
		CONTRIBUTION_PICTURE_MAX_EDGE / Math.max(bitmap.width, bitmap.height),
	);
	const canvas = new OffscreenCanvas(
		Math.round(bitmap.width * scale),
		Math.round(bitmap.height * scale),
	);
	const context = canvas.getContext('2d');
	if (!context) throw new Error(PHOTO_UNREADABLE, { cause: file.name });
	context.imageSmoothingQuality = 'high';
	context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	const blob = await canvas.convertToBlob({
		type: 'image/jpeg',
		quality: JPEG_QUALITY,
	});
	return new Uint8Array(await blob.arrayBuffer());
}

function entryName(file: File, index: number): string {
	const base = file.name.replace(/\.[^.]+$/, '').replace(/[\\/]/g, '-');
	return `${String(index + 1).padStart(2, '0')}-${base}.jpg`;
}

/**
 * One photo at a time keeps memory to a single decoded image. The zip stores
 * the JPEGs as they are: recompressing them gains nothing.
 */
export async function buildContributionArchive(
	files: File[],
	onProgress: (done: number) => void,
): Promise<{ archive: Blob; photosTakenAt?: string }> {
	const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
	let earliest: Date | null = null;

	for (const [index, file] of files.entries()) {
		const shotAt = await readShotDate(file);
		if (shotAt && (!earliest || shotAt < earliest)) earliest = shotAt;
		entries[entryName(file, index)] = [await downscale(file), { level: 0 }];
		onProgress(index + 1);
	}

	const zipped = zipSync(entries);
	return {
		archive: new Blob([zipped], { type: 'application/zip' }),
		photosTakenAt: earliest?.toISOString(),
	};
}

/** `fetch` cannot report upload progress, so the PUT goes through XHR. */
export function uploadArchive(
	upload: { url: string; contentType: string },
	archive: Blob,
	onProgress: (ratio: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('PUT', upload.url);
		request.setRequestHeader('Content-Type', upload.contentType);
		request.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) onProgress(event.loaded / event.total);
		});
		request.addEventListener('load', () =>
			request.status >= 200 && request.status < 300
				? resolve()
				: reject(new Error(UPLOAD_FAILED, { cause: request.status })),
		);
		request.addEventListener('error', () => reject(new Error(UPLOAD_FAILED)));
		request.send(archive);
	});
}
