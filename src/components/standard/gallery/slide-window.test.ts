import { describe, expect, it } from 'vitest';
import { isNearSlide, wrapIndex } from './slide-window';

describe('isNearSlide', () => {
	it('keeps the current slide and its neighbours', () => {
		expect(isNearSlide(10, 10, 240)).toBe(true);
		expect(isNearSlide(9, 10, 240)).toBe(true);
		expect(isNearSlide(11, 10, 240)).toBe(true);
		expect(isNearSlide(12, 10, 240)).toBe(false);
	});

	it('wraps around the ends of a looping carousel', () => {
		expect(isNearSlide(239, 0, 240)).toBe(true);
		expect(isNearSlide(0, 239, 240)).toBe(true);
		expect(isNearSlide(238, 0, 240)).toBe(false);
	});
});

describe('wrapIndex', () => {
	it('wraps negative and overflowing indexes', () => {
		expect(wrapIndex(-1, 240)).toBe(239);
		expect(wrapIndex(240, 240)).toBe(0);
		expect(wrapIndex(17, 240)).toBe(17);
	});
});
