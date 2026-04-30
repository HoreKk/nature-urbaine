import { Box, Container, Grid, Icon, Skeleton } from '@chakra-ui/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import PictureCard from '@/components/cards/PictureCard';
import ContributeCta from '@/components/sections/ContributeCta';
import PageHeader from '@/components/sections/PageHeader';
import UIPagination from '@/components/standard/Pagination';
import PictureLightbox from '@/components/standard/PictureLightbox';
import { EmptyState } from '@/components/ui/empty-state';
import {
	getPicturesByTag,
	getTagById,
	type PictureWithReport,
} from '@/server/tags';

const LIMIT_PER_PAGE = 24;

export const Route = createFileRoute('/reports/tag/$id')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const tagId = Number(params.id);

		context.queryClient.prefetchQuery(
			queryOptions({
				queryKey: ['tag', tagId, 'pictures', 1],
				queryFn: () =>
					getPicturesByTag({
						data: { tagId, page: 1, pageSize: LIMIT_PER_PAGE },
					}),
			}),
		);

		const tag = await getTagById({ data: tagId });
		if (!tag) throw notFound({ routeId: Route.id });

		return { tag };
	},
});

function RouteComponent() {
	const { tag } = Route.useLoaderData();

	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<PictureWithReport | null>(null);

	const { data: pictures, isLoading } = useSuspenseQuery(
		queryOptions({
			queryKey: ['tag', tag.id, 'pictures', page],
			queryFn: () =>
				getPicturesByTag({
					data: { tagId: tag.id, page, pageSize: LIMIT_PER_PAGE },
				}),
		}),
	);

	const totalDocs = pictures.totalDocs ?? 0;

	return (
		<>
			<PageHeader
				eyebrow={`Étiquette · ${totalDocs} photo${totalDocs > 1 ? 's' : ''}`}
				title={tag.name}
				description={
					tag.description ||
					'Toutes les photos taguées avec cette étiquette, à travers nos reportages.'
				}
			/>
			<Container maxW="container.xl" mt={10}>
				<Grid
					templateColumns={{
						base: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(3, 1fr)',
						lg: 'repeat(4, 1fr)',
					}}
					gap={6}
				>
					{pictures.docs.length === 0 ? (
						<EmptyState
							gridColumn="span 4"
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucune photo trouvée"
							description="Aucune photo n'est associée à cette étiquette pour le moment."
						/>
					) : (
						pictures.docs.map((picture) => (
							<Skeleton key={picture.id} loading={isLoading}>
								<PictureCard picture={picture} onSelect={setSelected} />
							</Skeleton>
						))
					)}
				</Grid>
			</Container>
			<Box mt={16}>
				<UIPagination
					totalDocs={totalDocs}
					limit={LIMIT_PER_PAGE}
					page={page}
					onPageChange={setPage}
				/>
			</Box>
			<ContributeCta />
			<PictureLightbox picture={selected} onClose={() => setSelected(null)} />
		</>
	);
}
