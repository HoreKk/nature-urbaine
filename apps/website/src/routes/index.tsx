import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Icon,
	Text,
} from '@chakra-ui/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { RiArrowRightLine } from 'react-icons/ri';
import ReportCard from '@/components/reports/Card';
import { getReports } from '@/server/reports';

export const Route = createFileRoute('/')({
	loader: async () => {
		const reports = await getReports({ data: { page: 1, pageSize: 6 } });
		return { reports };
	},
	component: App,
});

function App() {
	const { reports } = Route.useLoaderData();

	return (
		<Container maxW="container.xl" py={8}>
			<Box py={16} textAlign="center">
				<Heading size="5xl" fontWeight="black" mb={4}>
					Nature Urbaine
				</Heading>
				<Text fontSize="lg" color="fg.muted" maxW="650px" mx="auto">
					Explorez la beauté cachée de nos villes à travers nos reportages
					photographiques et les interviews inspirantes de nos explorateurs
					urbains.
				</Text>
			</Box>
			<Flex justify="space-between" align="center">
				<Flex direction="column" align="flex-start">
					<Heading>Derniers reportages</Heading>
					<Text color="fg.muted">
						Découvrez nos dernières explorations urbaines
					</Text>
				</Flex>
				<Link to="/reports">
					<Flex align="center" gap={1} color="fg.info">
						<Text>Voir tous les reportages</Text>
						<Icon as={RiArrowRightLine} />
					</Flex>
				</Link>
			</Flex>
			<Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
				{reports.docs.map((report) => (
					<ReportCard key={report.id} report={report} />
				))}
			</Grid>
		</Container>
	);
}
