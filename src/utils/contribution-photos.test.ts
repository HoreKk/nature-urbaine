import { describe, expect, it } from 'vitest';
import { parseExifDate } from './contribution-photos';

describe('parseExifDate', () => {
	it('reads the EXIF date as local time', () => {
		expect(parseExifDate('2024:05:12 14:20:11')).toEqual(
			new Date(2024, 4, 12, 14, 20, 11),
		);
	});

	it.each([undefined, '', '0000:00:00 00:00:00', '12/05/2024'])(
		'ignores %j',
		(value) => {
			expect(parseExifDate(value)).toBeNull();
		},
	);
});
