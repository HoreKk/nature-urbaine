import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';
import { fetchOrReturnRealValue } from './tools';

export type SearchResult = {
	kind: 'tag';
	label: string;
	value: string;
	hint?: string;
	parentName?: string;
};

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

		const tags = await context.db.find({
			collection: 'tags',
			where: { name: { contains: searchTerm } },
			limit: 10,
			depth: 1,
		});

		// `depth: 1` above already hydrates `tagCategory` and `parentId` as
		// objects, so `fetchOrReturnRealValue` short-circuits without firing
		// additional findByID calls. We keep the helper as a safety net in case a
		// future depth change reverts to numeric refs.
		const results: SearchResult[] = await Promise.all(
			tags.docs.map(async (tag) => {
				const [tagCategory, parentTag] = await Promise.all([
					fetchOrReturnRealValue(tag.tagCategory, 'tag-categories'),
					tag.parentId
						? fetchOrReturnRealValue(tag.parentId, 'tags')
						: Promise.resolve(null),
				]);
				return {
					kind: 'tag',
					label: tag.name,
					value: tag.id.toString(),
					hint: tagCategory?.name,
					parentName: parentTag?.name,
				};
			}),
		);

		return results;
	});
