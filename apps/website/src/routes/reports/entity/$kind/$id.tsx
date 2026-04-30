import { Icon, Skeleton } from '@chakra-ui/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState, type JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import PictureCard from '@/components/cards/PictureCard';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import PaginatedListLayout from '@/components/standard/PaginatedListLayout';
import PictureLightbox from '@/components/standard/PictureLightbox';
import { ENTITY_CONTENT } from '@/content/entity-search';
import {
	getCategoryListQuery,
	getEntityByKind,
	getEntityListQuery,
	getTagListQuery,
	LIMITS_BY_ENTITY,
	isEntityKind,
} from '@/server/entity-search';
import type { PictureWithReport } from '@/server/tags';

export const Route = createFileRoute('/reports/entity/$kind/$id')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const id = Number(params.id);
		if (!isEntityKind(params.kind)) throw notFound({ routeId: Route.id });
		const kind = params.kind;

		if (!Number.isFinite(id) || id <= 0) throw notFound({ routeId: Route.id });
		const listQuery = getEntityListQuery({ kind, id, page: 1 });

		context.queryClient.prefetchQuery(
			queryOptions({
				queryKey: listQuery.queryKey,
				queryFn: listQuery.queryFn,
			}),
		);

		const entity = await getEntityByKind({ kind, id });
		if (!entity) throw notFound({ routeId: Route.id });

		return { kind, id, entity };
	},
});

function RouteComponent(): JSX.Element {
	const { kind, id, entity } = Route.useLoaderData();
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<PictureWithReport | null>(null);

	if (kind === 'tag') {
		const listQuery = getTagListQuery({ id, page });
		const { data: list, isLoading } = useSuspenseQuery(
			queryOptions({
				queryKey: listQuery.queryKey,
				queryFn: listQuery.queryFn,
			}),
		);

		const content = ENTITY_CONTENT.tag;
		const totalDocs = list.totalDocs ?? 0;

		return (
			<>
				<PaginatedListLayout
					eyebrow={`${content.eyebrow} · ${totalDocs} ${content.resultLabel}${totalDocs > 1 ? 's' : ''}`}
					title={entity.name}
					description={entity.description || content.description}
					totalDocs={totalDocs}
					limit={LIMITS_BY_ENTITY.tag}
					page={page}
					onPageChange={setPage}
					gridTemplateColumns={{
						base: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(3, 1fr)',
						lg: 'repeat(4, 1fr)',
					}}
					gridGap={6}
					isEmpty={list.docs.length === 0}
					emptyGridColumn="span 4"
					emptyIcon={<Icon as={RiErrorWarningFill} />}
					emptyTitle={content.emptyTitle}
					emptyDescription={content.emptyDescription}
				>
					{list.docs.map((picture) => (
						<Skeleton key={picture.id} loading={isLoading}>
							<PictureCard picture={picture} onSelect={setSelected} />
						</Skeleton>
					))}
				</PaginatedListLayout>
				<PictureLightbox picture={selected} onClose={() => setSelected(null)} />
			</>
		);
	}

	const listQuery = getCategoryListQuery({ id, page });
	const { data: list, isLoading } = useSuspenseQuery(
		queryOptions({
			queryKey: listQuery.queryKey,
			queryFn: listQuery.queryFn,
		}),
	);
	const content = ENTITY_CONTENT.category;
	const totalDocs = list.totalDocs ?? 0;

	return (
		<PaginatedListLayout
			eyebrow={`${content.eyebrow} · ${totalDocs} ${content.resultLabel}${totalDocs > 1 ? 's' : ''}`}
			title={entity.name}
			description={content.description}
			totalDocs={totalDocs}
			limit={LIMITS_BY_ENTITY.category}
			page={page}
			onPageChange={setPage}
			gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
			gridGap={8}
			isEmpty={list.docs.length === 0}
			emptyGridColumn="span 3"
			emptyIcon={<Icon as={RiErrorWarningFill} />}
			emptyTitle={content.emptyTitle}
			emptyDescription={content.emptyDescription}
		>
			{list.docs.map((report) => (
				<Skeleton key={report.id} loading={isLoading}>
					<ProjectCard {...reportToProjectCardProps(report)} />
				</Skeleton>
			))}
		</PaginatedListLayout>
	);
}
