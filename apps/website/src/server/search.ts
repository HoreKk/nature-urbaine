import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';
import { fetchOrReturnRealValue } from './tools';

export type SearchResult =
	| { kind: 'category'; label: string; value: string }
	| { kind: 'tag'; label: string; value: string; hint?: string }
	| { kind: 'location'; label: string; value: string };

export const getSearchResults = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(
		z.object({
			searchTerm: z.string(),
		}),
	)
	.handler(async ({ data, context }): Promise<SearchResult[]> => {
		const { searchTerm } = data;
		if (!searchTerm) return [];

		const [categories, tags, reportsForCity] = await Promise.all([
			context.db.find({
				collection: 'categories',
				where: { name: { contains: searchTerm } },
				limit: 5,
			}),
			context.db.find({
				collection: 'tags',
				where: { name: { contains: searchTerm } },
				limit: 20,
				depth: 1,
				joins: { relatedChildTags: { count: true } },
			}),
			context.db.find({
				collection: 'reports',
				where: { 'locationDetails.city': { contains: searchTerm } },
				limit: 30,
				depth: 0,
			}),
		]);

		const categoryResults: SearchResult[] = categories.docs.map((category) => ({
			kind: 'category',
			label: category.name,
			value: category.id.toString(),
		}));

		const leafTags = tags.docs
			.filter((tag) => (tag.relatedChildTags?.totalDocs ?? 0) === 0)
			.slice(0, 5);

		const tagResults: SearchResult[] = await Promise.all(
			leafTags.map(async (tag) => {
				const tagCategory = await fetchOrReturnRealValue(
					tag.tagCategory,
					'tag-categories',
				);
				return {
					kind: 'tag',
					label: tag.name,
					value: tag.id.toString(),
					hint: tagCategory?.name,
				};
			}),
		);

		const seenCities = new Set<string>();
		const locationResults: SearchResult[] = [];
		for (const report of reportsForCity.docs) {
			const city = report.locationDetails?.city?.trim();
			if (!city || seenCities.has(city)) continue;
			seenCities.add(city);
			locationResults.push({
				kind: 'location',
				label: city,
				value: city,
			});
			if (locationResults.length >= 5) break;
		}

		return [...categoryResults, ...tagResults, ...locationResults];
	});
