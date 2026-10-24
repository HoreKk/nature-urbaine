import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Icon,
	Stack,
	Text,
} from '@chakra-ui/react';
import { createFileRoute, Link, type LinkProps } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { RiArrowRightLine } from 'react-icons/ri';
import ProjectCard from '@/components/cards/ProjectCard';
import {
	interviewToProjectCardProps,
	reportToProjectCardProps,
} from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import Features from '@/components/sections/Features';
import LibraryStats from '@/components/sections/LibraryStats';
import { getLibraryStats } from '@/server/categories';
import { getRandomInterviews } from '@/server/interviews';
import { findRandomReports, findReportCatalog } from '@/server/report-catalog';
import { cardGridColumns } from '@/utils/grid';

export const Route = createFileRoute('/')({
	loader: async () => {
		const [latestReports, randomInterviews, stats] = await Promise.all([
			findReportCatalog({ data: { page: 1, pageSize: 3 } }),
			getRandomInterviews({ data: { count: 3 } }),
			getLibraryStats(),
		]);
		const randomReports = await findRandomReports({
			data: {
				count: 3,
				excludeIds: latestReports.docs.map((report) => report.id),
			},
		});
		return {
			latestReports: latestReports.docs,
			randomReports,
			randomInterviews,
			stats,
		};
	},
	component: App,
});

function App() {
	const { latestReports, randomReports, randomInterviews, stats } =
		Route.useLoaderData();

	return (
		<>
			<Box as="section" borderBottom="1px solid" borderColor="border.muted">
				<Container maxW="container.xl" pt={{ base: 12, md: 28 }} pb={16}>
					<Heading as="h1" textStyle="display" maxW="900px">
						Les images de référence d’
						<Text as="em" textStyle="emphasis" fontWeight={400}>
							aménagements urbains
						</Text>
						.
					</Heading>
					<Text textStyle="lead" maxW="640px" mt={7}>
						Plateforme collaborative dédiée aux professionnels de l'aménagement
						des espaces extérieurs, maîtres d'ouvrage et maîtres d'œuvre.
						Inspirez-vous d'une riche collection de projets et de banques
						d'images, partagées par des passionnés du paysage.
					</Text>
				</Container>
			</Box>
			<Features />
			<Container maxW="container.xl" py={16}>
				<Stack gap={16}>
					<CardSection
						title="Derniers reportages"
						description="Les trois reportages les plus récents"
						linkTo="/reports"
						linkLabel="Voir tous les reportages"
					>
						{latestReports.map((report) => (
							<ProjectCard
								key={report.id}
								{...reportToProjectCardProps(report)}
							/>
						))}
					</CardSection>
					<CardSection
						title="Reportages à découvrir"
						description="Une sélection au hasard dans le catalogue"
						linkTo="/reports"
						linkLabel="Explorer le catalogue"
					>
						{randomReports.map((report) => (
							<ProjectCard
								key={report.id}
								{...reportToProjectCardProps(report)}
							/>
						))}
					</CardSection>
					<CardSection
						title="Interviews"
						description="Des paroles de professionnels, choisies au hasard"
						linkTo="/interviews"
						linkLabel="Voir toutes les interviews"
					>
						{randomInterviews.map((interview) => (
							<ProjectCard
								key={interview.id}
								{...interviewToProjectCardProps(interview)}
							/>
						))}
					</CardSection>
				</Stack>
			</Container>
			<LibraryStats totals={stats.totals} categories={stats.categories} />
			<ContributeCta />
		</>
	);
}

function CardSection({
	title,
	description,
	linkTo,
	linkLabel,
	children,
}: {
	title: string;
	description: string;
	linkTo: LinkProps['to'];
	linkLabel: string;
	children: ReactNode;
}) {
	return (
		<Box as="section">
			<Flex justify="space-between" align="center">
				<Flex direction="column" align="flex-start">
					<Heading>{title}</Heading>
					<Text color="fg.muted">{description}</Text>
				</Flex>
				<Link to={linkTo}>
					<Flex align="center" gap={1} color="primary.fg">
						<Text>{linkLabel}</Text>
						<Icon as={RiArrowRightLine} />
					</Flex>
				</Link>
			</Flex>
			<Grid templateColumns={cardGridColumns} gap={8} mt={4}>
				{children}
			</Grid>
		</Box>
	);
}
