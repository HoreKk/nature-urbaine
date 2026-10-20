import {
	Box,
	Center,
	Link as ChakraLink,
	Flex,
	Highlight,
	Icon,
	Spinner,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { JSX } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import { searchQueryOptions } from '@/queries/search';

type TagSearchResultsProps = {
	query: string;
};

export function TagSearchResults({
	query,
}: TagSearchResultsProps): JSX.Element {
	const { data, isLoading } = useQuery(searchQueryOptions(query));

	if (isLoading) {
		return (
			<Center py={10}>
				<Spinner />
			</Center>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Center py={10} flexDirection="column" gap={3} color="fg.muted">
				<Icon as={RiErrorWarningFill} boxSize={8} />
				<Text textStyle="title.s">
					Aucune étiquette trouvée pour « {query} »
				</Text>
				<Text fontSize="sm">
					Essayez un mot-clef plus court ou parcourez la taxonomie.
				</Text>
			</Center>
		);
	}

	return (
		<VStack
			align="stretch"
			gap={0}
			borderTop="1px solid"
			borderColor="border.muted"
		>
			{data.map((item) => (
				<ChakraLink
					key={item.value}
					asChild
					px={3}
					py={3}
					borderBottom="1px solid"
					borderColor="border.muted"
					_hover={{ textDecor: 'none', bgColor: 'bg.muted' }}
				>
					<Link to="/tags/$id" params={{ id: item.value }}>
						<Flex align="center" justify="space-between" gap={3} w="full">
							<Box>
								<Highlight
									ignoreCase
									query={query}
									styles={{
										bg: 'yellow.emphasized',
										fontWeight: 'medium',
									}}
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
	);
}
