import {
	Center,
	Link as ChakraLink,
	Combobox,
	Portal,
	Spinner,
	useListCollection,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import { getSearchResults } from '@/server/search';

type SearchItem = {
	kind: 'category';
	value: string;
	label: string;
};

type SearchComboboxProps = {
	placeholder?: string;
	maxW?: string | number;
	size?: 'sm' | 'md' | 'lg';
};

const SearchCombobox = ({
	placeholder = 'Rechercher un lieu, une catégorie...',
	maxW = '640px',
	size = 'md',
}: SearchComboboxProps) => {
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 400);

	const { collection, set } = useListCollection<SearchItem>({
		initialItems: [],
		groupBy: ({ kind }) => (kind === 'category' ? 'Catégories' : 'Autres'),
		itemToString: ({ label }) => label,
		itemToValue: ({ value }) => value,
	});

	const { isLoading } = useQuery({
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
	);
};

export default SearchCombobox;
