import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { PaginatedDocs } from 'payload';
import { z } from 'zod';
import type { Category, Picture, Report } from '@/payload/payload-types';
import { baseProcedure } from './db';
import { withMediaUrls } from './media-urls';
import { frontPictureOf, galleryPicturePopulate } from './picture-join';

export const REPORT_CATALOG_PAGE_SIZE = 50;

export const reportCatalogFilterSchema = z.object({
	category: z.array(z.coerce.number<number>()).optional(),
	search: z.string().optional(),
	city: z.string().optional(),
});

export type ReportCatalogFilter = z.infer<typeof reportCatalogFilterSchema>;

export interface AugmentedReport extends Omit<
	Report,
	'category' | 'relatedPictures'
> {
	category: Category;
	relatedPictures: {
		docs?: Picture[];
		hasNextPage?: boolean;
		totalDocs?: number;
	};
	frontPicture: Picture | null;
}

function withFrontPicture<
	T extends { relatedPictures?: { docs?: (number | Picture)[] } },
>(report: T): T & { frontPicture: Picture | null } {
	return { ...report, frontPicture: frontPictureOf(report.relatedPictures) };
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
	.validator(
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
			joins: { relatedPictures: { limit: 1 } },
		});

		return withMediaUrls({
			...reports,
			docs: reports.docs.map((r) => withFrontPicture(r as AugmentedReport)),
		} as PaginatedDocs<AugmentedReport>);
	});

export const findReportById = createServerFn({ method: 'GET' })
	.validator(z.number().min(1))
	.middleware([baseProcedure])
	.handler(async ({ data: id, context }) => {
		const report = await context.db.findByID({
			collection: 'reports',
			id,
			depth: 1,
			populate: { pictures: galleryPicturePopulate },
		});

		if (!report) throw notFound();

		return withMediaUrls(withFrontPicture(report as AugmentedReport));
	});
