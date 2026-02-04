import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { PaginatedDocs } from 'cms-payload';
import type { Category, Media, Report } from 'cms-payload/src/payload-types';
import { z } from 'zod';
import { fetchOrReturnRealValue } from '@/utils/tools';
import { baseProcedure } from './db';

export interface AugmentedReport extends Report {
	thumbnail: Media;
	category: Category;
}

async function augmentReports(reports: Report[]): Promise<AugmentedReport[]> {
	const augmentedDocs = await Promise.all(
		reports.map(async (report) => ({
			...report,
			thumbnail: await fetchOrReturnRealValue(report.thumbnail, 'media'),
			category: await fetchOrReturnRealValue(report.category, 'categories'),
		})),
	);
	return augmentedDocs;
}

export const getReports = createServerFn({ method: 'GET' })
	.inputValidator(
		z.object({
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
		}),
	)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { page = 1, pageSize = 10 } = data;

		const tmpReports = await context.db.find({
			collection: 'reports',
			limit: pageSize,
			page,
			depth: 1,
			sort: '-date',
		});

		const augmentedReports = {
			...tmpReports,
			docs: await augmentReports(tmpReports.docs),
		} as PaginatedDocs<AugmentedReport>;

		return augmentedReports;
	});

export const getReportById = createServerFn({ method: 'GET' })
	.inputValidator(z.number().min(1))
	.middleware([baseProcedure])
	.handler(async ({ data: id, context }) => {
		const tmpReport = await context.db.findByID({
			collection: 'reports',
			id,
		});

		if (!tmpReport) throw notFound();

		const [augmentedReport] = await augmentReports([tmpReport]);

		return augmentedReport;
	});
