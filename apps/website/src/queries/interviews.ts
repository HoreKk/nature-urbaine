import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import {
	getInterviewById,
	getInterviews,
	interviewFilterSchema,
} from '@/server/interviews';

export { interviewFilterSchema };
export type InterviewFilters = z.infer<typeof interviewFilterSchema>;

export const INTERVIEWS_PAGE_SIZE = 12;

export const interviewsQueryOptions = (
	page: number,
	filters?: InterviewFilters,
	pageSize = INTERVIEWS_PAGE_SIZE,
) =>
	queryOptions({
		queryKey: ['interviews', page, filters],
		queryFn: () => getInterviews({ data: { page, pageSize, filters } }),
	});

export const interviewByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['interviews', id],
		queryFn: () => getInterviewById({ data: id }),
	});
