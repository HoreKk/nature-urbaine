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

export const REPORT_CATALOG_PAGE_SIZE = 15;

export const reportCatalogFilterSchema = z.object({
	category: z.array(z.coerce.number<number>()).optional(),
	search: z.string().optional(),
	city: z.string().optional(),
});

export type ReportCatalogFilter = z.infer<typeof reportCatalogFilterSchema>;

export interface AugmentedReport extends Omit<
	Report,
	'thumbnail' | 'category' | 'relatedPictures'
> {
	thumbnail: Media;
	category: Category;
	relatedPictures: Picture[];
}

function buildWhere(filter: ReportCatalogFilter) {
	let where = {};

	if (filter.category && filter.category.length > 0) {
		where = { ...where, category: { in: filter.category } };
	}

	if (filter.city && filter.city.length > 0) {
		where = { ...where, 'locationDetails.city': { equals: filter.city } };
	}

	if (filter.search && filter.search.length > 0) {
		where = {
			...where,
			or: [
				{ name: { contains: filter.search } },
				{ description: { contains: filter.search } },
			],
		};
	}

	return where;
}

export const findReportCatalog = createServerFn({ method: 'GET' })
	.inputValidator(
		z.object({
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
			filter: reportCatalogFilterSchema.optional(),
		}),
	)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { page, pageSize, filter } = data;

		const reports = await context.db.find({
			collection: 'reports',
			limit: pageSize,
			page,
			depth: 2,
			sort: '-date',
			where: filter ? buildWhere(filter) : {},
		});

		return reports as PaginatedDocs<AugmentedReport>;
	});

export const findReportById = createServerFn({ method: 'GET' })
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
