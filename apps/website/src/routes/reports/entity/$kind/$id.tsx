import { Icon, Skeleton } from '@chakra-ui/react';
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
	createPaginatedQueryOptions,
	usePaginatedResource,
} from '@/hooks/use-paginated-resource';
import {
	REPORT_CATALOG_PAGE_SIZE,
	reportCatalogQueryOptions,
} from '@/queries/report-catalog';
import {
	getEntityByKind,
	getTagListQuery,
	isEntityKind,
	TAG_PICTURES_PAGE_SIZE,
} from '@/server/entity-search';
import type { PictureWithReport } from '@/server/tags';

export const Route = createFileRoute('/reports/entity/$kind/$id')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const id = Number(params.id);
		if (!isEntityKind(params.kind)) throw notFound({ routeId: Route.id });
		const kind = params.kind;

		if (!Number.isFinite(id) || id <= 0) throw notFound({ routeId: Route.id });

		if (kind === 'category') {
			context.queryClient.prefetchQuery(
				reportCatalogQueryOptions(1, { category: [id] }),
			);
		} else {
			context.queryClient.prefetchQuery(
				createPaginatedQueryOptions(getTagListQuery({ id, page: 1 })),
			);
		}

		const entity = await getEntityByKind({ kind, id });
		if (!entity) throw notFound({ routeId: Route.id });

		return { kind, id, entity };
	},
});

function RouteComponent(): JSX.Element {
	const { kind, id, entity } = Route.useLoaderData();
	const [selected, setSelected] = useState<PictureWithReport | null>(null);

	if (kind === 'tag') {
		const { docs, totalDocs, isLoading, page, setPage, content } =
			usePaginatedResource({
				getListQuery: (currentPage) =>
					getTagListQuery({ id, page: currentPage }),
				content: ENTITY_CONTENT.tag,
			});

		return (
			<>
				<PaginatedListLayout
					eyebrow={`${content.eyebrow} · ${totalDocs} ${content.resultLabel}${totalDocs > 1 ? 's' : ''}`}
					title={entity.name}
					description={entity.description || content.description}
					totalDocs={totalDocs}
					limit={TAG_PICTURES_PAGE_SIZE}
					page={page}
					onPageChange={setPage}
					gridTemplateColumns={{
						base: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(3, 1fr)',
						lg: 'repeat(4, 1fr)',
					}}
					gridGap={6}
					isEmpty={docs.length === 0}
					emptyGridColumn="span 4"
					emptyIcon={<Icon as={RiErrorWarningFill} />}
					emptyTitle={content.emptyTitle}
					emptyDescription={content.emptyDescription}
				>
					{docs.map((picture) => (
						<Skeleton key={picture.id} loading={isLoading}>
							<PictureCard picture={picture} onSelect={setSelected} />
						</Skeleton>
					))}
				</PaginatedListLayout>
				<PictureLightbox picture={selected} onClose={() => setSelected(null)} />
			</>
		);
	}

	const { docs, totalDocs, isLoading, page, setPage, content } =
		usePaginatedResource({
			getListQuery: (currentPage) =>
				reportCatalogQueryOptions(currentPage, { category: [id] }),
			content: ENTITY_CONTENT.category,
		});

	return (
		<PaginatedListLayout
			eyebrow={`${content.eyebrow} · ${totalDocs} ${content.resultLabel}${totalDocs > 1 ? 's' : ''}`}
			title={entity.name}
			description={content.description}
			totalDocs={totalDocs}
			limit={REPORT_CATALOG_PAGE_SIZE}
			page={page}
			onPageChange={setPage}
			gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
			gridGap={8}
			isEmpty={docs.length === 0}
			emptyGridColumn="span 3"
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
