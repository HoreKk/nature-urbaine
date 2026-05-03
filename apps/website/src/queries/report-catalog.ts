import { queryOptions } from '@tanstack/react-query';
import {
	findReportById,
	findReportCatalog,
	REPORT_CATALOG_PAGE_SIZE,
	type ReportCatalogFilter,
	reportCatalogFilterSchema,
} from '@/server/report-catalog';

export {
	REPORT_CATALOG_PAGE_SIZE,
	reportCatalogFilterSchema,
	type ReportCatalogFilter,
};

export const reportCatalogQueryOptions = (
	page: number,
	filter?: ReportCatalogFilter,
	pageSize: number = REPORT_CATALOG_PAGE_SIZE,
) => ({
	queryKey: ['report-catalog', page, pageSize, filter] as const,
	queryFn: () => findReportCatalog({ data: { page, pageSize, filter } }),
});

export const reportByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['report-catalog', 'by-id', id] as const,
		queryFn: () => findReportById({ data: id }),
	});
