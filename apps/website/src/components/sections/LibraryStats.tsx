import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Stat,
	Text,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import Wordmark from '../standard/Wordmark';

type CategoryCount = {
	id: number;
	name: string;
	reportsCount: number;
};

type LibraryStatsProps = {
	totals: {
		categories: number;
		reports: number;
		interviews: number;
	};
	categories: CategoryCount[];
};

const CATEGORY_PALETTE = [
	'oklch(60% 0.10 130)',
	'oklch(60% 0.10 220)',
	'oklch(62% 0.10 75)',
	'oklch(55% 0.08 290)',
	'oklch(58% 0.10 30)',
	'oklch(55% 0.10 175)',
	'oklch(50% 0.08 320)',
	'oklch(60% 0.10 50)',
	'oklch(58% 0.10 145)',
	'oklch(50% 0.08 90)',
	'oklch(55% 0.10 250)',
	'oklch(50% 0.04 60)',
];

const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

const LibraryStats = ({ totals, categories }: LibraryStatsProps) => {
	const stats = [
		{ label: 'Reportages', value: totals.reports },
		{ label: 'Interviews', value: totals.interviews },
		{ label: 'Catégories', value: totals.categories },
	];

	return (
		<Box as="section" borderTop="1px solid" borderColor="border.muted">
			<Container maxW="container.xl" py={{ base: 14, md: 20 }}>
				<Flex
					justify="space-between"
					align="baseline"
					gap={6}
					flexWrap="wrap"
					mb={10}
				>
					<Box>
						<Wordmark title="La bibliothèque en chiffres" />
					</Box>
				</Flex>
				<Grid
					templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
					gap={8}
					mb={{ base: 14, md: 20 }}
				>
					{stats.map((s) => (
						<Stat.Root key={s.label} borderWidth="1px" p={6}>
							<Stat.Label textStyle="kicker">{s.label}</Stat.Label>
							<Stat.ValueText textStyle="stat.value">
								{formatNumber(s.value)}
							</Stat.ValueText>
						</Stat.Root>
					))}
				</Grid>
				<Flex
					justify="space-between"
					align="baseline"
					mb={4}
					flexWrap="wrap"
					gap={3}
				>
					<Flex flexDir="column" gap={2}>
						<Text textStyle="kicker">
							{`${String(totals.categories).padStart(2, '0')} catégories`}
						</Text>
						<Heading as="h3" textStyle="heading.md">
							Reportages par thématique
						</Heading>
					</Flex>
					<Link to="/reports">
						<Text fontSize="13px" color="fg" fontWeight={500}>
							Tous les reportages →
						</Text>
					</Link>
				</Flex>
				<Grid
					templateColumns={{
						base: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(3, 1fr)',
						lg: 'repeat(4, 1fr)',
					}}
					columnGap={{ base: 6, md: 8 }}
					rowGap={0}
				>
					{categories.map((cat, i) => (
						<Link
							key={cat.id}
							to="/reports/entity/$kind/$id"
							params={{ kind: 'category', id: cat.id.toString() }}
						>
							<Flex
								align="center"
								justify="space-between"
								py={3}
								borderTop="1px solid"
								borderColor="border.muted"
								color="fg"
							>
								<Flex align="center" gap={2} minW={0}>
									<Box
										flexShrink={0}
										w="8px"
										h="8px"
										borderRadius="full"
										bgColor={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]}
									/>
									<Text textStyle="title.s" truncate>
										{cat.name}
									</Text>
								</Flex>
								<Text textStyle="mono.s" flexShrink={0}>
									{formatNumber(cat.reportsCount)}
								</Text>
							</Flex>
						</Link>
					))}
				</Grid>
			</Container>
		</Box>
	);
};

export default LibraryStats;
