import type { PaginatedDocs } from '@nature-urbaine/database';
import type { QueryKey } from '@tanstack/react-query';
import {
	type AugmentedReport,
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
): {
	queryKey: QueryKey;
	queryFn: () => Promise<PaginatedDocs<AugmentedReport>>;
} => ({
	queryKey: ['report-catalog', page, pageSize, filter],
	queryFn: () => findReportCatalog({ data: { page, pageSize, filter } }),
});

export const reportByIdQueryOptions = (id: number) => ({
	queryKey: ['report-catalog', 'by-id', id] as const,
	queryFn: () => findReportById({ data: id }),
});
