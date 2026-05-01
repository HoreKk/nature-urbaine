import {
	Box,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Icon,
	Separator,
	Text,
} from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import {
	RiBuildingLine,
	RiCalendarLine,
	RiMapPinLine,
	RiUserLine,
} from 'react-icons/ri';
import { UIBreadcrumb } from '@/components/standard/Breadcrumb';
import { Prose } from '@/components/ui/prose';
import type { InterviewDetail } from '@/server/interviews';
import { getInterviewById } from '@/server/interviews';

export const Route = createFileRoute('/interviews/$id')({
	component: RouteComponent,
	loader: async ({ params }) => getInterviewById({ data: Number(params.id) }),
	head: ({ loaderData: interview }) => {
		if (!interview) return {};
		const description = interview.summary
			? interview.summary.slice(0, 160)
			: `Interview avec ${interview.interviewee} — Nature Urbaine`;
		return {
			meta: [
				{ title: `${interview.name} — Nature Urbaine` },
				{ name: 'description', content: description },
				{ property: 'og:title', content: interview.name },
				{ property: 'og:description', content: description },
				{ property: 'og:type', content: 'article' },
			],
		};
	},
});

type QuestionBlockProps = {
	question: string;
	html: string;
};

function QuestionBlock({ question, html }: QuestionBlockProps) {
	return (
		<Box>
			<Flex gap={3} alignItems="flex-start" mb={4}>
				<Box
					flexShrink={0}
					w={1}
					borderRadius="full"
					bgColor="primary.emphasized"
					alignSelf="stretch"
				/>
				<Text
					fontSize="lg"
					fontWeight="semibold"
					lineHeight="1.5"
					fontStyle="italic"
				>
					{question}
				</Text>
			</Flex>
			<Box pl={4}>
				<Prose dangerouslySetInnerHTML={{ __html: html }} maxW="none" />
			</Box>
		</Box>
	);
}

function RouteComponent() {
	const interview = Route.useLoaderData() as InterviewDetail;

	return (
		<>
			<UIBreadcrumb
				links={[
					{ label: 'Accueil', to: '/' },
					{ label: 'Interviews', to: '/interviews' },
				]}
				currentLinkLabel={interview.name}
			/>

			{/* Hero — matches the listing page header pattern */}
			<Box
				as="section"
				py={{ base: 10, md: 14 }}
				bgColor="bg"
				borderBottom="1px solid"
				borderColor="border.muted"
			>
				<Container maxW="container.xl">
					<Text textStyle="kicker" mb={4}>
						Interview · À la rencontre de
					</Text>
					<Heading as="h1" textStyle="heading.xl" mb={4} maxW="container.md">
						{interview.name}
					</Heading>

					<Flex gap={6} flexWrap="wrap" alignItems="center" mt={4}>
						{/* Interviewee */}
						<Flex alignItems="center" gap={2}>
							<Flex
								w={9}
								h={9}
								borderRadius="full"
								bgColor="primary.muted"
								alignItems="center"
								justifyContent="center"
							>
								<Icon as={RiUserLine} boxSize={4} color="primary.fg" />
							</Flex>
							<Flex flexDir="column">
								<Text fontWeight="bold" fontSize="sm">
									{interview.interviewee}
								</Text>
								<Text fontSize="xs" color="fg.muted">
									{interview.intervieweeRole}
								</Text>
							</Flex>
						</Flex>

						<Separator orientation="vertical" height={8} />

						<Flex alignItems="center" gap={2}>
							<Icon as={RiMapPinLine} boxSize={4} color="fg.muted" />
							<Text fontSize="sm" color="fg.muted">
								{interview.city}
								{interview.department ? `, ${interview.department}` : ''}
							</Text>
						</Flex>

						<Separator orientation="vertical" height={8} />

						<Flex alignItems="center" gap={2}>
							<Icon as={RiCalendarLine} boxSize={4} color="fg.muted" />
							<Text fontSize="sm" color="fg.muted">
								{new Date(interview.publishedAt).toLocaleDateString('fr-FR', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}
							</Text>
						</Flex>
					</Flex>
				</Container>
			</Box>

			<Container maxW="container.xl" pt={10} pb={16}>
				<Grid templateColumns="repeat(12, 1fr)" gap={8}>
					{/* Main content */}
					<GridItem colSpan={{ base: 12, md: 8 }}>
						{/* Summary — accent border uses primary token */}
						<Box
							bgColor="bg.muted"
							p={6}
							borderRadius="lg"
							boxShadow="sm"
							mb={10}
							borderLeft="4px solid"
							borderColor="primary.emphasized"
						>
							<Text
								fontSize="md"
								color="fg.muted"
								fontStyle="italic"
								lineHeight="1.75"
							>
								{interview.summary}
							</Text>
						</Box>

						{/* 3 rich text Q&A blocks */}
						<Flex flexDir="column" gap={10}>
							<QuestionBlock
								question="Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?"
								html={interview.projectDetails.objectives}
							/>

							<Separator />

							<QuestionBlock
								question="Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ?"
								html={interview.projectDetails.impacts}
							/>

							<Separator />

							<QuestionBlock
								question="Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?"
								html={interview.projectDetails.challenges}
							/>
						</Flex>
					</GridItem>

					{/* Sticky sidebar */}
					<GridItem
						colSpan={{ base: 12, md: 4 }}
						position="sticky"
						top={12}
						alignSelf="start"
					>
						<Flex flexDir="column" gap={4}>
							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Le projet
								</Heading>
								<Flex flexDir="column" gap={3}>
									<Flex flexDir="column" gap={1}>
										<Text color="fg.muted" fontSize="sm">
											Superficie
										</Text>
										<Text>{interview.area}</Text>
									</Flex>
									<Separator />
									<Flex flexDir="column" gap={1}>
										<Text color="fg.muted" fontSize="sm">
											Date de réalisation
										</Text>
										<Text>
											{new Date(interview.realisedAt).toLocaleDateString(
												'fr-FR',
												{
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												},
											)}
										</Text>
									</Flex>
								</Flex>
							</Box>

							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Acteurs
								</Heading>
								<Flex flexDir="column" gap={3}>
									<Flex flexDir="column" gap={1}>
										<Flex alignItems="center" gap={1.5}>
											<Icon
												as={RiBuildingLine}
												boxSize={3.5}
												color="fg.muted"
											/>
											<Text color="fg.muted" fontSize="sm">
												Maîtrise d'ouvrage
											</Text>
										</Flex>
										<Text>{interview.projectOwner}</Text>
									</Flex>
									<Separator />
									<Flex flexDir="column" gap={1}>
										<Flex alignItems="center" gap={1.5}>
											<Icon
												as={RiBuildingLine}
												boxSize={3.5}
												color="fg.muted"
											/>
											<Text color="fg.muted" fontSize="sm">
												Maîtrise d'œuvre
											</Text>
										</Flex>
										<Text>{interview.projectManagement}</Text>
									</Flex>
								</Flex>
							</Box>

							<Box bgColor="bg.muted" p={6} borderRadius="lg" boxShadow="sm">
								<Heading size="2xl" mb={4}>
									Localisation
								</Heading>
								<Flex flexDir="column" gap={2}>
									<Flex alignItems="center" gap={2}>
										<Icon as={RiMapPinLine} boxSize={4} color="primary.solid" />
										<Text>{interview.city}</Text>
									</Flex>
									{interview.department && (
										<Text fontSize="sm" color="fg.muted" pl={6}>
											{interview.department}
										</Text>
									)}
								</Flex>
							</Box>
						</Flex>
					</GridItem>
				</Grid>
			</Container>
		</>
	);
}
