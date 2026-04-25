import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';

export const getSearchResults = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(
		z.object({
			searchTerm: z.string(),
		}),
	)
	.handler(async ({ data, context }) => {
		const { searchTerm } = data;

		const categories = await context.db.find({
			collection: 'categories',
			where: {
				name: { contains: searchTerm },
			},
			limit: 5,
		});

		const results = categories.docs.map(
			(category) =>
				({
					kind: 'category',
					label: category.name,
					value: category.id.toString(),
				}) as const,
		);

		return results;
	});
