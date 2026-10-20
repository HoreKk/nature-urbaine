import { Icon, Skeleton } from '@chakra-ui/react';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState, type JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import PictureCard from '@/components/cards/PictureCard';
import PaginatedListLayout from '@/components/standard/PaginatedListLayout';
import PictureLightbox from '@/components/standard/PictureLightbox';
import { TAG_CONTENT } from '@/content/tags';
import {
	createPaginatedQueryOptions,
	usePaginatedResource,
} from '@/hooks/use-paginated-resource';
import {
	picturesByTagQueryOptions,
	TAG_PICTURES_PAGE_SIZE,
} from '@/queries/tags';
import { getTagById } from '@/server/tags';
import type { PictureWithReport } from '@/server/tags';

export const Route = createFileRoute('/tags/$id')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const id = Number(params.id);
		if (!Number.isFinite(id) || id <= 0) throw notFound({ routeId: Route.id });

		context.queryClient.prefetchQuery(
			createPaginatedQueryOptions(picturesByTagQueryOptions(id, 1)),
		);

		const tag = await getTagById({ data: id });
		if (!tag) throw notFound({ routeId: Route.id });

		return { id, tag };
	},
});

function RouteComponent(): JSX.Element {
	const { id, tag } = Route.useLoaderData();
	const [selected, setSelected] = useState<PictureWithReport | null>(null);

	const { docs, totalDocs, isLoading, page, setPage, content } =
		usePaginatedResource({
			getListQuery: (currentPage) => picturesByTagQueryOptions(id, currentPage),
			content: TAG_CONTENT,
		});

	return (
		<>
			<PaginatedListLayout
				eyebrow={`${content.eyebrow} · ${totalDocs} ${content.resultLabel}${totalDocs > 1 ? 's' : ''}`}
				title={tag.name}
				description={tag.description || content.description}
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
