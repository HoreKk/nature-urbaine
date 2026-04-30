import { Icon, Skeleton } from '@chakra-ui/react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import type { JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import PaginatedListLayout from '@/components/standard/PaginatedListLayout';
import { FIELD_CONTENT } from '@/content/entity-search';
import {
	createPaginatedQueryOptions,
	usePaginatedResource,
} from '@/hooks/use-paginated-resource';
import {
	getFieldByKind,
	type FieldKind,
	getFieldListQuery,
	LIMITS_BY_FIELD,
	isFieldKind,
} from '@/server/entity-search';

export const Route = createFileRoute('/reports/field/$field/$value')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		if (!isFieldKind(params.field)) throw notFound({ routeId: Route.id });
		const field: FieldKind = params.field;
		const value = params.value;

		if (!value) throw notFound({ routeId: Route.id });

		const listQuery = getFieldListQuery({ field, value, page: 1 });

		context.queryClient.prefetchQuery(createPaginatedQueryOptions(listQuery));

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
				getFieldListQuery({ field, value, page: currentPage }),
			content: FIELD_CONTENT[field],
		});

	return (
		<PaginatedListLayout
			eyebrow={`${content.eyebrow} · ${totalDocs} reportage${totalDocs > 1 ? 's' : ''}`}
			title={fieldData.label}
			description={content.description}
			totalDocs={totalDocs}
			limit={LIMITS_BY_FIELD[field]}
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
