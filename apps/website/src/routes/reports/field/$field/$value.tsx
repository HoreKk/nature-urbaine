import { Icon, Skeleton } from '@chakra-ui/react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import type { JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import PaginatedListLayout from '@/components/standard/PaginatedListLayout';
import { FIELD_CONTENT } from '@/content/entity-search';
import { usePaginatedResource } from '@/hooks/use-paginated-resource';
import {
	REPORT_CATALOG_PAGE_SIZE,
	type ReportCatalogFilter,
	reportCatalogQueryOptions,
} from '@/queries/report-catalog';
import {
	getFieldByKind,
	type FieldKind,
	isFieldKind,
} from '@/server/entity-search';

function fieldFilter(field: FieldKind, value: string): ReportCatalogFilter {
	switch (field) {
		case 'city':
			return { city: value };
	}
}

export const Route = createFileRoute('/reports/field/$field/$value')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		if (!isFieldKind(params.field)) throw notFound({ routeId: Route.id });
		const field: FieldKind = params.field;
		const value = params.value;

		if (!value) throw notFound({ routeId: Route.id });

		context.queryClient.prefetchQuery(
			reportCatalogQueryOptions(1, fieldFilter(field, value)),
		);

		const fieldData = await getFieldByKind({ field, value });
		if (!fieldData) throw notFound({ routeId: Route.id });

		return { field, value, fieldData };
	},
});

function RouteComponent(): JSX.Element {
	const { field, value, fieldData } = Route.useLoaderData();
	const { docs, totalDocs, isLoading, page, setPage, content } =
		usePaginatedResource({
			getListQuery: (currentPage) =>
				reportCatalogQueryOptions(currentPage, fieldFilter(field, value)),
			content: FIELD_CONTENT[field],
		});

	return (
		<PaginatedListLayout
			eyebrow={`${content.eyebrow} · ${totalDocs} reportage${totalDocs > 1 ? 's' : ''}`}
			title={fieldData.label}
			description={content.description}
			totalDocs={totalDocs}
			limit={REPORT_CATALOG_PAGE_SIZE}
			page={page}
			onPageChange={setPage}
			gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
			gridGap={8}
			isEmpty={docs.length === 0}
			emptyIcon={<Icon as={RiErrorWarningFill} />}
			emptyTitle={content.emptyTitle}
			emptyDescription={content.emptyDescription}
		>
			{docs.map((report) => (
				<Skeleton key={report.id} loading={isLoading}>
					<ProjectCard {...reportToProjectCardProps(report)} />
				</Skeleton>
			))}
		</PaginatedListLayout>
	);
}
