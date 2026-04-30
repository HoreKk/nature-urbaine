import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';

export const getAllCategories = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }) => {
		const categories = await context.db.find({
			collection: 'categories',
			limit: 100,
			depth: 1,
			sort: 'name',
		});

		return categories.docs;
	});

export const getLibraryStats = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }) => {
		const [categories, reports, interviews] = await Promise.all([
			context.db.find({
				collection: 'categories',
				limit: 100,
				depth: 1,
				sort: 'name',
				joins: { relatedReports: { count: true } },
			}),
			context.db.count({ collection: 'reports' }),
			context.db.count({ collection: 'interviews' }),
		]);

		const categoryCounts = categories.docs.map((category) => ({
			id: category.id,
			name: category.name,
			reportsCount: category.relatedReports?.totalDocs ?? 0,
		}));

		return {
			totals: {
				categories: categories.totalDocs,
				reports: reports.totalDocs,
				interviews: interviews.totalDocs,
			},
			categories: categoryCounts.toSorted(
				(a, b) => b.reportsCount - a.reportsCount,
			),
		};
	});

export const getCategoryById = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(z.number())
	.handler(async ({ data: id, context }) => {
		const category = await context.db.findByID({
			collection: 'categories',
			id,
			depth: 1,
		});

		return category;
	});
