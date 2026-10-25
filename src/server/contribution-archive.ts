import { unzipSync } from 'fflate';
import {
	ARCHIVE_INVALID,
	CONTRIBUTION_MAX_ARCHIVE_BYTES,
	CONTRIBUTION_MAX_PICTURES,
} from './contribution-contract';

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

// The form only zips JPEGs, and the operator unzips this on their own machine:
// check signatures, and cap the unpacked size before inflating.
export function inspectContributionArchive(bytes: Uint8Array): {
	pictureCount: number;
} {
	let entries = 0;
	let unpackedBytes = 0;

	let files: Record<string, Uint8Array>;
	try {
		files = unzipSync(bytes, {
			filter: (file) => {
				entries += 1;
				unpackedBytes += file.originalSize;
				if (
					entries > CONTRIBUTION_MAX_PICTURES ||
					unpackedBytes > CONTRIBUTION_MAX_ARCHIVE_BYTES ||
					file.name.includes('/')
				) {
					throw new Error(ARCHIVE_INVALID);
				}
				return true;
			},
		});
	} catch {
		throw new Error(ARCHIVE_INVALID);
	}

	const pictures = Object.values(files);
	if (
		pictures.length === 0 ||
		!pictures.every((picture) =>
			JPEG_SIGNATURE.every((byte, index) => picture[index] === byte),
		)
	) {
		throw new Error(ARCHIVE_INVALID);
	}

	return { pictureCount: pictures.length };
}
