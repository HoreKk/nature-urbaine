import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { PaginatedDocs } from 'cms-payload';
import type { Interview } from 'cms-payload/src/payload-types';
import { convertLexicalToHTML } from 'cms-payload/src/utils/lexical';
import { z } from 'zod';
import { baseProcedure } from './db';

// List items don't need the richText payload — only the scalar fields.
export type SafeInterview = Omit<Interview, 'projectDetails'> & {
	projectDetails?: never;
};

// Detail view: projectDetails fields are pre-converted to HTML strings.
export type InterviewDetail = Omit<Interview, 'projectDetails'> & {
	projectDetails: {
		objectives: string;
		impacts: string;
		challenges: string;
	};
};

export const interviewFilterSchema = z.object({
	search: z.string().optional(),
});

export const getInterviews = createServerFn({ method: 'GET' })
	.inputValidator(
		z.object({
			page: z.number().min(1),
			pageSize: z.number().min(1).max(100),
			filters: interviewFilterSchema.optional(),
		}),
	)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { page = 1, pageSize = 12 } = data;

		let where = {};

		if (data.filters?.search && data.filters.search.length > 0) {
			const search = data.filters.search;
			where = {
				...where,
				or: [
					{ name: { contains: search } },
					{ summary: { contains: search } },
					{ interviewee: { contains: search } },
					{ city: { contains: search } },
				],
			};
		}

		const interviews = await context.db.find({
			collection: 'interviews',
			limit: pageSize,
			page,
			depth: 0,
			sort: '-publishedAt',
			where,
		});

		return interviews as unknown as PaginatedDocs<SafeInterview>;
	});

export const getInterviewById = createServerFn({ method: 'GET' })
	.inputValidator(z.number().min(1))
	.middleware([baseProcedure])
	.handler(async ({ data: id, context }) => {
		const interview = await context.db.findByID({
			collection: 'interviews',
			id,
			depth: 0,
		});

		if (!interview) throw notFound();

		const objectives = convertLexicalToHTML({
			data: interview.projectDetails.objectives,
		});
		const impacts = convertLexicalToHTML({
			data: interview.projectDetails.impacts,
		});
		const challenges = convertLexicalToHTML({
			data: interview.projectDetails.challenges,
		});

		return {
			...interview,
			projectDetails: { objectives, impacts, challenges },
		} as unknown as InterviewDetail;
	});
