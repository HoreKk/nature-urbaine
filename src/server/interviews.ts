import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { PaginatedDocs } from 'payload';
import { z } from 'zod';
import type {
	Interview,
	InterviewPicture,
	Media,
} from '@/payload/payload-types';
import { convertLexicalToHTML } from '@/payload/utils/lexical';
import { baseProcedure } from './db';
import { withMediaUrls } from './media-urls';
import { frontPictureOf, galleryPicturePopulate } from './picture-join';

/**
 * Website reads never populate `interview`. Typed as an id, it keeps Interview's
 * recursive Lexical types out of TanStack's serializability check.
 */
export type InterviewGalleryPicture = Omit<InterviewPicture, 'interview'> & {
	interview: number;
};

type InterviewMedia = {
	intervieweePicture?: Media | null;
	frontPicture: InterviewGalleryPicture | null;
};

// List items don't need the richText payload — only the scalar fields.
export type SafeInterview = Omit<
	Interview,
	'questions' | 'intervieweePicture' | 'relatedPictures'
> &
	InterviewMedia & { questions?: never };

export type InterviewDetail = Omit<
	Interview,
	'questions' | 'intervieweePicture' | 'relatedPictures'
> &
	InterviewMedia & {
		questions: { id?: string | null; question: string; answer: string }[];
		relatedPictures: { docs?: InterviewGalleryPicture[] };
	};

export const interviewFilterSchema = z.object({
	search: z.string().optional(),
});

export const getInterviews = createServerFn({ method: 'GET' })
	.validator(
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
			depth: 1,
			sort: '-publishedAt',
			where,
			joins: { relatedPictures: { limit: 1 } },
			populate: { 'interview-pictures': galleryPicturePopulate },
		});

		return withMediaUrls({
			...interviews,
			docs: interviews.docs.map((interview) => ({
				...interview,
				frontPicture: frontPictureOf(interview.relatedPictures),
			})),
		} as unknown as PaginatedDocs<SafeInterview>);
	});

export const getInterviewById = createServerFn({ method: 'GET' })
	.validator(z.number().min(1))
	.middleware([baseProcedure])
	.handler(async ({ data: id, context }) => {
		const interview = await context.db.findByID({
			collection: 'interviews',
			id,
			depth: 1,
			populate: { 'interview-pictures': galleryPicturePopulate },
		});

		if (!interview) throw notFound();

		const questions = interview.questions.map((row) => ({
			...row,
			answer: convertLexicalToHTML({ data: row.answer }),
		}));

		return withMediaUrls({
			...interview,
			questions,
			frontPicture: frontPictureOf(interview.relatedPictures),
		} as unknown as InterviewDetail);
	});
