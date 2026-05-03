import type {
	Category,
	Media,
	PaginatedDocs,
	Picture,
	Report,
} from '@nature-urbaine/database';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { baseProcedure } from './db';

export const filterSchema = z.object({
	category: z.array(z.coerce.number<number>()).optional(),
	search: z.string().optional(),
	city: z.string().optional(),
});

export interface AugmentedReport extends Omit<
	Report,
	'thumbnail' | 'category' | 'relatedPictures'
> {
	thumbnail: Media;
	category: Category;
	relatedPictures: Picture[];
}

export const getReports = createServerFn({ method: 'GET' })
	.inputValidator(
		z.object({
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
			filters: filterSchema.optional(),
		}),
	)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { page = 1, pageSize = 10 } = data;

		let where = {};

		if (data.filters) {
			const { category, search, city } = data.filters;

			if (category && category.length > 0) {
				where = {
					...where,
					category: { in: category },
				};
			}

			if (city && city.length > 0) {
				where = {
					...where,
					'locationDetails.city': { equals: city },
				};
			}

			if (search && search.length > 0) {
				where = {
					...where,
					or: [
						{ name: { contains: search } },
						{ description: { contains: search } },
					],
				};
			}
		}

		const reports = await context.db.find({
			collection: 'reports',
			limit: pageSize,
			page,
			depth: 2,
			sort: '-date',
			where,
		});

		return reports as PaginatedDocs<AugmentedReport>;
	});

export const getReportById = createServerFn({ method: 'GET' })
	.inputValidator(z.number().min(1))
	.middleware([baseProcedure])
	.handler(async ({ data: id, context }) => {
		const report = await context.db.findByID({
			collection: 'reports',
			id,
			depth: 2,
		});

		if (!report) throw notFound();

		return report as AugmentedReport;
	});
