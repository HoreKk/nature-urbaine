import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Skeleton,
	Text,
} from '@chakra-ui/react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ReportCard from '@/components/reports/Card';
import ContributeCta from '@/components/sections/ContributeCta';
import UIPagination from '@/components/standard/Pagination';
import { getReports } from '@/server/reports';

const LIMIT_PER_PAGE = 15;

export const Route = createFileRoute('/reports/')({
	component: RouteComponent,
	loader: () => getReports({ data: { page: 1, pageSize: LIMIT_PER_PAGE } }),
});

function RouteComponent() {
	const loaderReports = Route.useLoaderData();

	const [page, setPage] = useState(1);
	const totalDocs = loaderReports.totalDocs;

	const { data, isEnabled, isFetching } = useQuery(
		queryOptions({
			queryKey: ['reports', page],
			queryFn: () => getReports({ data: { page, pageSize: LIMIT_PER_PAGE } }),
			enabled: page !== 1,
			initialData: loaderReports,
		}),
	);

	const reports = isEnabled ? data.docs : loaderReports.docs;

	return (
		<>
			<Box py={12} bgColor="bg.emphasized">
				<Container maxW="container.xl">
					<Heading size="5xl" fontWeight="black">
						Reportages
					</Heading>
					<Text fontSize="xl" color="fg.muted">
						Plongez dans nos explorations photographiques urbaines
					</Text>
				</Container>
			</Box>
			<Container maxW="container.xl" mt={8}>
				<Text>TODO: Form recherche + filtres + sort</Text>
			</Container>
			<Box
				borderY="solid 1px"
				borderColor="border.emphasized"
				bgColor="bg.muted"
				mt={8}
			>
				<Container
					maxW="container.xl"
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					py={4}
				>
					<Flex gap={2}>
						Filtres actifs :<Flex gap={2}></Flex>
					</Flex>
					<Text>
						<Text as="span" color="fg.info" fontWeight="bold">
							{totalDocs}
						</Text>{' '}
						reportages trouvés
					</Text>
				</Container>
			</Box>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns="repeat(3, 1fr)" gap={8}>
					{reports.map((report) => (
						<Skeleton key={report.id} loading={isFetching}>
							<ReportCard report={report} />
						</Skeleton>
					))}
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
