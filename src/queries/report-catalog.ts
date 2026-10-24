import { queryOptions } from '@tanstack/react-query';
import {
	findReportById,
	findReportCatalog,
	REPORT_CATALOG_PAGE_SIZE,
	REPORT_CATALOG_SORTS,
	type ReportCatalogFilter,
	reportCatalogFilterSchema,
	type ReportCatalogSort,
} from '@/server/report-catalog';

export {
	REPORT_CATALOG_PAGE_SIZE,
	REPORT_CATALOG_SORTS,
	reportCatalogFilterSchema,
	type ReportCatalogFilter,
	type ReportCatalogSort,
};

// The route loader fills the cache before render; without a staleTime the
// component would refetch the entry it was just handed.
export const reportCatalogQueryOptions = (
	page: number,
	filter?: ReportCatalogFilter,
	pageSize: number = REPORT_CATALOG_PAGE_SIZE,
) =>
	queryOptions({
		queryKey: ['report-catalog', page, pageSize, filter] as const,
		queryFn: () => findReportCatalog({ data: { page, pageSize, filter } }),
		staleTime: 60_000,
	});

export const reportByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['report-catalog', 'by-id', id] as const,
		queryFn: () => findReportById({ data: id }),
	});
