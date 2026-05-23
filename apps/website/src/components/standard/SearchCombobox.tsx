import {
	Box,
	Center,
	Link as ChakraLink,
	Combobox,
	Flex,
	Highlight,
	Portal,
	Spinner,
	Text,
	useListCollection,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import {
	useEffect,
	useRef,
	useState,
	type JSX,
	type KeyboardEvent,
} from 'react';
import { LuSearch } from 'react-icons/lu';
import { getSearchResults, type SearchResult } from '@/server/search';

type SearchComboboxProps = {
	placeholder?: string;
	maxW?: string | number;
	size?: 'sm' | 'md' | 'lg';
	onSelect?: () => void;
	focusOnMount?: boolean;
};

function SearchCombobox({
	placeholder = 'Rechercher une étiquette...',
	maxW = '640px',
	size = 'md',
	onSelect,
	focusOnMount = false,
}: SearchComboboxProps): JSX.Element {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 400);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (focusOnMount) {
			inputRef.current?.focus();
		}
	}, [focusOnMount]);

	const { collection, set } = useListCollection<SearchResult>({
		initialItems: [],
		itemToString: ({ label }) => label,
		itemToValue: ({ value }) => value,
	});

	const { isLoading } = useQuery({
		queryKey: ['search', debouncedSearch],
		queryFn: async () => {
			const results = await getSearchResults({
				data: { searchTerm: debouncedSearch },
			});
			set(results);
			return results;
		},
		enabled: debouncedSearch !== '',
	});

	const py = size === 'lg' ? 4 : size === 'sm' ? 2 : 3;

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'Enter') return;
		// Let Chakra's Combobox handle Enter when a highlighted item exists; the
		// combobox stops propagation in that case. If Enter reaches us, no item
		// was active — navigate to the picker with the current query.
		event.preventDefault();
		const trimmed = search.trim();
		navigate(
			trimmed ? { to: '/tags', search: { q: trimmed } } : { to: '/tags' },
		);
		onSelect?.();
	};

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
					ref={inputRef}
					placeholder={placeholder}
					borderRadius="full"
					borderColor="primary.solid"
					bgColor="bg"
					px={5}
					py={py}
					onKeyDown={handleKeyDown}
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
							debouncedSearch ? (
								<Combobox.Empty>
									Aucune étiquette pour "{debouncedSearch}" — appuyez sur Entrée
									pour rechercher.
								</Combobox.Empty>
							) : (
								<Combobox.Empty>
									Tapez un mot-clef pour rechercher une étiquette.
								</Combobox.Empty>
							)
						) : (
							<VStack align="stretch" gap={0}>
								{collection.items.map((item) => (
									<ChakraLink
										key={item.value}
										asChild
										px={2}
										py={2}
										_hover={{ textDecor: 'none', bgColor: 'bg.muted' }}
									>
										<Link
											to="/tags/$id"
											params={{ id: item.value }}
											onClick={() => onSelect?.()}
										>
											<Flex
												align="center"
												justify="space-between"
												gap={3}
												w="full"
											>
												<Box>
													<Highlight
														ignoreCase
														query={debouncedSearch}
														styles={{ fontWeight: 'bold' }}
													>
														{item.label}
													</Highlight>
												</Box>
												{(item.hint || item.parentName) && (
													<Text textStyle="mono.s" color="fg.muted">
														{item.hint}
														{item.parentName && ` › ${item.parentName}`}
													</Text>
												)}
											</Flex>
										</Link>
									</ChakraLink>
								))}
							</VStack>
						)}
					</Combobox.Content>
				</Combobox.Positioner>
			</Portal>
		</Combobox.Root>
	);
}

export default SearchCombobox;
