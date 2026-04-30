import type {
	PaginatedDocs,
	Picture,
	Report,
	Tag,
} from '@nature-urbaine/database';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';
import { baseProcedure } from './db';

export type PictureWithReport = Omit<Picture, 'report'> & { report: Report };

export const getTagById = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(z.number())
	.handler(async ({ data: id, context }) => {
		const tag = await context.db.findByID({
			collection: 'tags',
			id,
			depth: 0,
		});

		if (!tag) throw notFound();

		return tag as Tag;
	});

export const getPicturesByTag = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.inputValidator(
		z.object({
			tagId: z.number(),
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
		}),
	)
	.handler(async ({ data, context }) => {
		const result = await context.db.find({
			collection: 'pictures',
			limit: data.pageSize,
			page: data.page,
			depth: 1,
			sort: '-createdAt',
			where: {
				relatedTags: { in: [data.tagId] },
			},
		});

		return {
			...result,
			docs: result.docs as PictureWithReport[],
		} satisfies PaginatedDocs<PictureWithReport>;
	});
