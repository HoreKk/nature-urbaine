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
import ProjectCard from '@/components/cards/ProjectCard';
import {
	interviewToProjectCardProps,
	reportToProjectCardProps,
} from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import Features from '@/components/sections/Features';
import SearchCombobox from '@/components/standard/SearchCombobox';
import { getInterviews } from '@/server/interviews';
import { getReports } from '@/server/reports';

export const Route = createFileRoute('/')({
	loader: async () => ({
		reports: await getReports({ data: { page: 1, pageSize: 3 } }),
		interviews: await getInterviews({ data: { page: 1, pageSize: 3 } }),
	}),
	component: App,
});

function App() {
	const { reports, interviews } = Route.useLoaderData();

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
							<Heading>Derniers reportages</Heading>
							<Text color="fg.muted">
								Découvrez nos dernières explorations urbaines
							</Text>
						</Flex>
						<Link to="/reports">
							<Flex align="center" gap={1} color="primary.accent">
								<Text>Voir tous les reportages</Text>
								<Icon as={RiArrowRightLine} />
							</Flex>
						</Link>
					</Flex>
					<Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
						{reports.docs.map((report) => (
							<ProjectCard
								key={report.id}
								{...reportToProjectCardProps(report)}
							/>
						))}
					</Grid>
				</Box>
				<Box mt={16}>
					<Flex justify="space-between" align="center">
						<Flex direction="column" align="flex-start">
							<Heading>Dernières interviews</Heading>
							<Text color="fg.muted">
								Plongez dans les récits inspirants de nos explorateurs urbains
							</Text>
						</Flex>
						<Link to="/interviews">
							<Flex align="center" gap={1} color="primary.accent">
								<Text>Voir toutes les interviews</Text>
								<Icon as={RiArrowRightLine} />
							</Flex>
						</Link>
					</Flex>
					<Grid templateColumns="repeat(3, 1fr)" gap={8} mt={4}>
						{interviews.docs.map((interview) => (
							<ProjectCard
								key={interview.id}
								{...interviewToProjectCardProps(interview)}
							/>
						))}
					</Grid>
				</Box>
			</Container>
			<ContributeCta />
		</>
	);
}
