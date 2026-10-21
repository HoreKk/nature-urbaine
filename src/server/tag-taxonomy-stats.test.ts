import { describe, expect, it } from 'vitest';
import { foldTagTaxonomyStats, type TaxonomyTag } from './tag-taxonomy-stats';

// Category 1: ÉCLAIRAGE (1) › JOUR (2) › {BORNE (3), MÂT (4)}. Category 2: SOL (5).
const tags: TaxonomyTag[] = [
	{ id: 1, parentId: null, categoryId: 1 },
	{ id: 2, parentId: 1, categoryId: 1 },
	{ id: 3, parentId: 2, categoryId: 1 },
	{ id: 4, parentId: 2, categoryId: 1 },
	{ id: 5, parentId: null, categoryId: 2 },
];

describe('foldTagTaxonomyStats', () => {
	it('counts a picture once per ancestor when several of its tags share it', () => {
		const stats = foldTagTaxonomyStats(tags, [{ tagIds: [3, 4] }]);

		expect(stats.tags[3]?.pictureCount).toBe(1);
		expect(stats.tags[4]?.pictureCount).toBe(1);
		expect(stats.tags[2]?.pictureCount).toBe(1);
		expect(stats.tags[1]?.pictureCount).toBe(1);
		expect(stats.tags[5]?.pictureCount).toBe(0);
	});

	it('counts distinct pictures per category', () => {
		const stats = foldTagTaxonomyStats(tags, [
			{ tagIds: [3, 4] },
			{ tagIds: [1, 5] },
			{ tagIds: [5] },
		]);

		expect(stats.categories[1]).toEqual({
			pictureCount: 2,
			descendantCount: 4,
		});
		expect(stats.categories[2]).toEqual({
			pictureCount: 2,
			descendantCount: 1,
		});
		expect(stats.tags[1]?.pictureCount).toBe(2);
		expect(stats.tags[2]?.pictureCount).toBe(1);
	});

	it('counts the whole subtree as descendants', () => {
		const stats = foldTagTaxonomyStats(tags, []);

		expect(stats.tags[1]?.descendantCount).toBe(3);
		expect(stats.tags[2]?.descendantCount).toBe(2);
		expect(stats.tags[3]?.descendantCount).toBe(0);
	});

	it('terminates on a parentId cycle', () => {
		const cyclic: TaxonomyTag[] = [
			{ id: 1, parentId: 2, categoryId: 1 },
			{ id: 2, parentId: 1, categoryId: 1 },
		];

		const stats = foldTagTaxonomyStats(cyclic, [{ tagIds: [1] }]);

		expect(stats.tags[1]?.pictureCount).toBe(1);
		expect(stats.tags[2]?.pictureCount).toBe(1);
	});
});
