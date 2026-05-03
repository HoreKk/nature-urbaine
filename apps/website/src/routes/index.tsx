import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Heading,
	HStack,
	Icon,
	Text,
} from '@chakra-ui/react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { RiArrowRightLine } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import {
	interviewToProjectCardProps,
	reportToProjectCardProps,
} from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import Features from '@/components/sections/Features';
import LibraryStats from '@/components/sections/LibraryStats';
import SearchCombobox from '@/components/standard/SearchCombobox';
import { getLibraryStats } from '@/server/categories';
import { getInterviews } from '@/server/interviews';
import { findReportCatalog } from '@/server/report-catalog';
import { cardGridColumns } from '@/utils/grid';

export const Route = createFileRoute('/')({
	loader: async () => ({
		reports: await findReportCatalog({ data: { page: 1, pageSize: 3 } }),
		interviews: await getInterviews({ data: { page: 1, pageSize: 3 } }),
		stats: await getLibraryStats(),
	}),
	component: App,
});

function App() {
	const { reports, interviews, stats } = Route.useLoaderData();

	const latestProjects = [
		...reports.docs.map((report) => ({
			key: `report-${report.id}`,
			date: report.date,
			props: reportToProjectCardProps(report),
		})),
		...interviews.docs.map((interview) => ({
			key: `interview-${interview.id}`,
			date: interview.publishedAt,
			props: interviewToProjectCardProps(interview),
		})),
	]
		.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	return (
		<>
			<Box as="section" borderBottom="1px solid" borderColor="border.muted">
				<Container maxW="container.xl" pt={{ base: 12, md: 28 }} pb={16}>
					<Heading as="h1" textStyle="display" maxW="900px">
						Une bibliothèque vivante du{' '}
						<Text as="em" textStyle="emphasis" fontWeight={400}>
							paysage urbain
						</Text>
						.
					</Heading>
					<Text textStyle="lead" maxW="640px" mt={7}>
						Plateforme collaborative dédiée aux professionnels de l'aménagement
						des espaces extérieurs, maîtres d'ouvrage et maîtres d'œuvre.
						Inspirez-vous d'une riche collection de projets et de banques
						d'images, partagée par des passionnés du paysage urbain.
					</Text>
					<HStack gap={3} mt={9} flexWrap="wrap">
						<Link to="/reports">
							<Button>
								Explorer les reportages
								<Icon as={RiArrowRightLine} />
							</Button>
						</Link>
						<Link to="/contribuer">
							<Button variant="outline">Contribuer</Button>
						</Link>
					</HStack>
					<Box mt={10}>
						<SearchCombobox size="lg" />
					</Box>
				</Container>
			</Box>
			<Features />
			<Container maxW="container.xl" py={16}>
				<Box>
					<Flex justify="space-between" align="center">
						<Flex direction="column" align="flex-start">
							<Heading>Dernières publications</Heading>
							<Text color="fg.muted">
								Reportages et interviews, par date de publication
							</Text>
						</Flex>
						<Link to="/reports">
							<Flex align="center" gap={1} color="primary.fg">
								<Text>Voir toutes les publications</Text>
								<Icon as={RiArrowRightLine} />
							</Flex>
						</Link>
					</Flex>
					<Grid templateColumns={cardGridColumns} gap={8} mt={4}>
						{latestProjects.map(({ key, props }) => (
							<ProjectCard key={key} {...props} />
						))}
					</Grid>
				</Box>
			</Container>
			<LibraryStats totals={stats.totals} categories={stats.categories} />
			<ContributeCta />
		</>
	);
}
