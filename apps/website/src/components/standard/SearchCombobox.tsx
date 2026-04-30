import {
	Center,
	Link as ChakraLink,
	Combobox,
	Flex,
	Portal,
	Spinner,
	Text,
	useListCollection,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link, type LinkProps } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useState, type JSX } from 'react';
import { LuSearch } from 'react-icons/lu';
import { getSearchResults, type SearchResult } from '@/server/search';

type SearchItem = SearchResult & { groupLabel: string };

const GROUP_LABELS: Record<SearchResult['kind'], string> = {
	category: 'Catégories',
	tag: 'Étiquettes',
	location: 'Lieux',
};

function itemToLinkProps(item: SearchItem): LinkProps {
	switch (item.kind) {
		case 'category':
			return {
				to: '/reports/entity/$kind/$id',
				params: { kind: 'category', id: item.value },
			};
		case 'tag':
			return {
				to: '/reports/entity/$kind/$id',
				params: { kind: 'tag', id: item.value },
			};
		case 'location':
			return {
				to: '/reports/field/$field/$value',
				params: { field: 'city', value: item.value },
			};
	}
}

type SearchComboboxProps = {
	placeholder?: string;
	maxW?: string | number;
	size?: 'sm' | 'md' | 'lg';
};

function SearchCombobox({
	placeholder = 'Rechercher un lieu, une catégorie, une étiquette...',
	maxW = '640px',
	size = 'md',
}: SearchComboboxProps): JSX.Element {
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 400);

	const { collection, set } = useListCollection<SearchItem>({
		initialItems: [],
		groupBy: ({ groupLabel }) => groupLabel,
		itemToString: ({ label }) => label,
		itemToValue: ({ kind, value }) => `${kind}-${value}`,
	});

	const { isLoading } = useQuery({
		queryKey: ['search', debouncedSearch],
		queryFn: async () => {
			const results = await getSearchResults({
				data: { searchTerm: debouncedSearch },
			});
			set(results.map((r) => ({ ...r, groupLabel: GROUP_LABELS[r.kind] })));
			return results;
		},
		enabled: debouncedSearch !== '',
	});

	const py = size === 'lg' ? 4 : size === 'sm' ? 2 : 3;

	return (
		<Combobox.Root
			collection={collection}
			maxW={maxW}
			onInputValueChange={(e) =>
				e.reason === 'input-change' && setSearch(e.inputValue)
			}
		>
			<Combobox.Control>
				<Combobox.Input
					placeholder={placeholder}
					borderRadius="full"
					borderColor="primary.solid"
					bgColor="bg"
					px={5}
					py={py}
					_hover={{ borderColor: 'primary.emphasized' }}
					_focus={{
						borderColor: 'primary.solid',
						boxShadow: '0 0 0 1px var(--chakra-colors-primary-solid)',
					}}
				/>
				<Combobox.Trigger
					position="absolute"
					right={4}
					top="50%"
					transform="translateY(-50%)"
					color="primary.fg"
				>
					<LuSearch />
				</Combobox.Trigger>
			</Combobox.Control>
			<Portal>
				<Combobox.Positioner>
					<Combobox.Content>
						{isLoading || search !== debouncedSearch ? (
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
									<Combobox.ItemGroupLabel>{group}</Combobox.ItemGroupLabel>
									<VStack align="stretch" gap={0}>
										{items.map((item) => (
											<ChakraLink
												key={`${item.kind}-${item.value}`}
												asChild
												px={2}
												py={2}
												_hover={{
													textDecor: 'none',
													bgColor: 'bg.muted',
												}}
											>
												<Link {...itemToLinkProps(item)}>
													<Flex
														align="center"
														justify="space-between"
														gap={3}
														w="full"
													>
														<Text>{item.label}</Text>
														{item.kind === 'tag' && item.hint && (
															<Text textStyle="mono.s">{item.hint}</Text>
														)}
													</Flex>
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
	);
}

export default SearchCombobox;
