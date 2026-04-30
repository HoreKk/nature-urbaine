import { Icon, Skeleton } from '@chakra-ui/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState, type JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import PaginatedListLayout from '@/components/standard/PaginatedListLayout';
import {
	getFieldByKind,
	type FieldKind,
	getFieldListQuery,
	LIMITS_BY_FIELD,
	FIELD_COPY,
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

		context.queryClient.prefetchQuery(
			queryOptions({
				queryKey: listQuery.queryKey,
				queryFn: listQuery.queryFn,
			}),
		);

		const fieldData = await getFieldByKind({ field, value });
		if (!fieldData) throw notFound({ routeId: Route.id });

		return { field, value, fieldData };
	},
});

function RouteComponent(): JSX.Element {
	const { field, value, fieldData } = Route.useLoaderData();
	const [page, setPage] = useState(1);

	const listQuery = getFieldListQuery({ field, value, page });

	const { data: reports, isLoading } = useSuspenseQuery(
		queryOptions({
			queryKey: listQuery.queryKey,
			queryFn: listQuery.queryFn,
		}),
	);

	const totalDocs = reports.totalDocs ?? 0;
	const copy = FIELD_COPY[field];

	return (
		<PaginatedListLayout
			eyebrow={`${copy.eyebrow} · ${totalDocs} reportage${totalDocs > 1 ? 's' : ''}`}
			title={fieldData.label}
			description={copy.description}
			totalDocs={totalDocs}
			limit={LIMITS_BY_FIELD[field]}
			page={page}
			onPageChange={setPage}
			gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
			gridGap={8}
			isEmpty={reports.docs.length === 0}
			emptyIcon={<Icon as={RiErrorWarningFill} />}
			emptyTitle={copy.emptyTitle}
			emptyDescription={copy.emptyDescription}
		>
			{reports.docs.map((report) => (
				<Skeleton key={report.id} loading={isLoading}>
					<ProjectCard {...reportToProjectCardProps(report)} />
				</Skeleton>
			))}
		</PaginatedListLayout>
	);
}
