import { Box, Container, Grid, Icon, Skeleton } from '@chakra-ui/react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import PageHeader from '@/components/sections/PageHeader';
import UIPagination from '@/components/standard/Pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { getReports } from '@/server/reports';

const LIMIT_PER_PAGE = 15;

export const Route = createFileRoute('/reports/location/$city')({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		const { city } = params;

		context.queryClient.prefetchQuery(
			queryOptions({
				queryKey: ['location', city, 'reports', 1],
				queryFn: () =>
					getReports({
						data: {
							page: 1,
							pageSize: LIMIT_PER_PAGE,
							filters: { city },
						},
					}),
			}),
		);

		return { city };
	},
});

function RouteComponent() {
	const { city } = Route.useLoaderData();
	const [page, setPage] = useState(1);

	const { data: reports, isLoading } = useSuspenseQuery(
		queryOptions({
			queryKey: ['location', city, 'reports', page],
			queryFn: () =>
				getReports({
					data: {
						page,
						pageSize: LIMIT_PER_PAGE,
						filters: { city },
					},
				}),
		}),
	);

	const totalDocs = reports.totalDocs ?? 0;

	return (
		<>
			<PageHeader
				eyebrow={`Lieu · ${totalDocs} reportage${totalDocs > 1 ? 's' : ''}`}
				title={city}
				description="Tous les reportages photographiques recensés dans cette ville."
			/>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
					{reports.docs.length === 0 ? (
						<EmptyState
							gridColumn="span 3"
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucun reportage trouvé"
							description="Aucun reportage n'est rattaché à cette ville pour le moment."
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
