import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { inspectContributionArchive } from './contribution-archive';
import { ARCHIVE_INVALID } from './contribution-contract';

const jpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

const zipOf = (files: Record<string, Uint8Array>) =>
	zipSync(
		Object.fromEntries(
			Object.entries(files).map(([name, data]) => [name, [data, { level: 0 }]]),
		),
	);

describe('inspectContributionArchive', () => {
	it('counts the JPEGs of a flat archive', () => {
		const archive = zipOf({ '01-a.jpg': jpeg(), '02-b.jpg': jpeg() });

		expect(inspectContributionArchive(archive)).toEqual({ pictureCount: 2 });
	});

	it.each([
		['a non-JPEG entry', zipOf({ '01-a.jpg': jpeg(), 'b.exe': strToU8('MZ') })],
		['an empty archive', zipOf({})],
		['a nested entry', zipOf({ 'dossier/01-a.jpg': jpeg() })],
		[
			'more than 50 photos',
			zipOf(
				Object.fromEntries(
					Array.from({ length: 51 }, (_, i) => [`${i}.jpg`, jpeg()]),
				),
			),
		],
		['bytes that are not a zip', strToU8('not a zip')],
	])('rejects %s', (_, archive) => {
		expect(() => inspectContributionArchive(archive)).toThrow(ARCHIVE_INVALID);
	});
});
