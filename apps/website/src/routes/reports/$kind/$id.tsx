import {
	Box,
	Container,
	Grid,
	Heading,
	Icon,
	Skeleton,
	Text,
} from '@chakra-ui/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import UIPagination from '@/components/standard/Pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { getCategoryById } from '@/server/categories';
import { getReports } from '@/server/reports';

const LIMIT_PER_PAGE = 15;

export const Route = createFileRoute('/reports/$kind/$id')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		context.queryClient.prefetchQuery(
			queryOptions({
				queryKey: [`${params.kind}-${params.id}-reports`, 1],
				queryFn: () =>
					getReports({
						data: {
							page: 1,
							pageSize: LIMIT_PER_PAGE,
							filters: { category: [Number(params.id)] },
						},
					}),
			}),
		);

		const category = await getCategoryById({ data: Number(params.id) });

		if (!category) throw notFound({ routeId: Route.id });

		return { category };
	},
});

function RouteComponent() {
	const { id, kind } = Route.useParams();
	const { category } = Route.useLoaderData();

	const [page, setPage] = useState(1);

	const { data: reports, isLoading } = useSuspenseQuery(
		queryOptions({
			queryKey: [`${kind}-${id}-reports`, page],
			queryFn: () =>
				getReports({
					data: {
						page,
						pageSize: LIMIT_PER_PAGE,
						filters: { [kind]: [Number(id)] },
					},
				}),
		}),
	);

	const totalDocs = reports.totalDocs ?? 0;

	return (
		<>
			<Box py={12} bgColor="bg.emphasized">
				<Container maxW="container.xl">
					<Heading size="5xl" fontWeight="black">
						Reportages dans la catégorie "{category.name}"
					</Heading>
					<Text fontSize="xl" color="fg.muted">
						Plongez dans nos explorations photographiques urbaines
					</Text>
				</Container>
			</Box>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns="repeat(3, 1fr)" gap={8}>
					{reports.docs.length === 0 ? (
						<EmptyState
							gridColumn="span 3"
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucun reportages trouvés"
							description="Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez."
						/>
					) : (
						reports.docs.map((report) => (
							<Skeleton key={report.id} loading={isLoading}>
								<ProjectCard {...reportToProjectCardProps(report)} />
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
		</>
	);
}
