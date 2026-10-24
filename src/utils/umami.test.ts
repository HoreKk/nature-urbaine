import { describe, expect, it } from 'vitest';
import { umamiBeforeSend } from './umami';

describe('umamiBeforeSend', () => {
	it('drops admin pages', () => {
		expect(umamiBeforeSend('event', { url: 'https://site.test/admin' })).toBe(
			false,
		);
		expect(
			umamiBeforeSend('event', {
				url: 'https://site.test/admin/collections/reports?page=2',
			}),
		).toBe(false);
	});

	it('keeps site pages, including ones that only start with "admin"', () => {
		for (const url of [
			'https://site.test/',
			'https://site.test/reports',
			'https://site.test/administration',
		]) {
			expect(umamiBeforeSend('event', { url })).toEqual({ url });
		}
	});

	it('keeps events without a url', () => {
		expect(umamiBeforeSend('event', { name: 'cta' })).toEqual({ name: 'cta' });
	});
});
