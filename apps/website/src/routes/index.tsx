import {
	Box,
	Center,
	Link as ChakraLink,
	Combobox,
	Container,
	Flex,
	Grid,
	Heading,
	Icon,
	Portal,
	Spinner,
	Text,
	useListCollection,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { RiArrowRightLine } from 'react-icons/ri';
import ReportCard from '@/components/reports/Card';
import ContributeCta from '@/components/sections/ContributeCta';
import { getReports } from '@/server/reports';
import { getSearchResults } from '@/server/search';

export const Route = createFileRoute('/')({
	loader: async () => ({
		reports: await getReports({ data: { page: 1, pageSize: 3 } }),
	}),
	component: App,
});

function App() {
	const { reports } = Route.useLoaderData();

	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 400);

	const { collection, set } = useListCollection<{
		kind: 'category';
		value: string;
		label: string;
	}>({
		initialItems: [],
		groupBy: ({ kind }) => (kind === 'category' ? 'Catégories' : 'Autres'),
		itemToString: ({ label }) => label,
		itemToValue: ({ value }) => value,
	});

	const { isLoading: searchLoading } = useQuery({
		queryKey: ['search', debouncedSearch],
		queryFn: async () => {
			const results = await getSearchResults({
				data: { searchTerm: debouncedSearch },
			});
			set([...results]);
			return results;
		},
		enabled: debouncedSearch !== '',
	});

	return (
		<>
			<Container maxW="container.xl" pt={8} pb={16}>
				<Box py={16} textAlign="center">
					<Heading size="5xl" fontWeight="black" mb={4}>
						Nature Urbaine
					</Heading>
					<Text fontSize="lg" color="fg.muted" maxW="650px" mx="auto">
						Explorez la beauté cachée de nos villes à travers nos reportages
						photographiques et les interviews inspirantes de nos explorateurs
						urbains.
					</Text>
					<Combobox.Root
						mx="auto"
						collection={collection}
						mt={8}
						width="500px"
						onInputValueChange={(e) =>
							e.reason === 'input-change' && setSearch(e.inputValue)
						}
					>
						<Combobox.Control>
							<Combobox.Input
								placeholder="Rechercher un lieu, une catégorie..."
								borderRadius="full"
								px={5}
								py={3}
							/>
						</Combobox.Control>
						<Portal>
							<Combobox.Positioner>
								<Combobox.Content>
									{searchLoading || search !== debouncedSearch ? (
										<Center py={4}>
											<Spinner />
										</Center>
									) : collection.items.length === 0 ? (
										<Combobox.Empty>
											Aucun résultat trouvé pour "{debouncedSearch}"
										</Combobox.Empty>
									) : (
										collection.group().map(([group, items]) => (
											<Combobox.ItemGroup key={group}>
												<Combobox.ItemGroupLabel>
													{group}
												</Combobox.ItemGroupLabel>
												<VStack align="stretch" gap={0}>
													{items.map(({ kind, value, label }) => (
														<ChakraLink
															key={value}
															asChild
															p={2}
															_hover={{
																textDecor: 'none',
																bgColor: 'bg.muted',
															}}
														>
															<Link
																to={`/reports/$kind/$id`}
																params={{ kind, id: value }}
															>
																{label}
															</Link>
														</ChakraLink>
													))}
												</VStack>
											</Combobox.ItemGroup>
										))
									)}
								</Combobox.Content>
							</Combobox.Positioner>
						</Portal>
					</Combobox.Root>
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
			<ContributeCta />
		</>
	);
}
