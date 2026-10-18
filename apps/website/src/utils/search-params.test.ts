import { payloadStringifySearch } from '@payloadcms/tanstack-start/shared';
import { describe, expect, it } from 'vitest';
import { parseSearch } from './search-params';

describe('parseSearch', () => {
	it('reads links written by the pre-v4 JSON serializer', () => {
		expect(parseSearch('?category=%5B1%2C2%5D&page=2&search=parc')).toEqual({
			category: [1, 2],
			page: '2',
			search: 'parc',
		});
		expect(parseSearch('?search=%222024%22')).toEqual({ search: '2024' });
	});

	it('round-trips the qs form it writes now', () => {
		const search = { category: ['1', '2'], page: '3', search: 'parc urbain' };
		expect(parseSearch(payloadStringifySearch(search))).toEqual(search);
	});

	it('keeps Payload admin filters and malformed values intact', () => {
		expect(
			parseSearch('?where[or][0][and][0][title][equals]=%5Bdraft%5D&limit=10'),
		).toEqual({
			where: { or: [{ and: [{ title: { equals: '[draft]' } }] }] },
			limit: '10',
		});
		expect(parseSearch('?search=%5Bparc')).toEqual({ search: '[parc' });
	});
});
