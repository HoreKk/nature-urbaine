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
