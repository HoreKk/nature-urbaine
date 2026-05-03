import { queryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import { filterSchema, getReportById, getReports } from '@/server/reports';

export { filterSchema };
export type ReportFilters = z.infer<typeof filterSchema>;

const REPORTS_PAGE_SIZE = 15;

export const reportsQueryOptions = (
	page: number,
	filters?: ReportFilters,
	pageSize = REPORTS_PAGE_SIZE,
) =>
	queryOptions({
		queryKey: ['reports', page, filters],
		queryFn: () => getReports({ data: { page, pageSize, filters } }),
	});

export const reportByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['reports', id],
		queryFn: () => getReportById({ data: id }),
	});
