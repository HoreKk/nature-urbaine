import { Box, Container, Text } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import type { JSX } from 'react';
import z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import SearchCombobox from '@/components/standard/SearchCombobox';

const tagsSearchSchema = z.object({
	q: z.string().optional(),
});

export const Route = createFileRoute('/tags/')({
	validateSearch: tagsSearchSchema,
	component: RouteComponent,
});

function RouteComponent(): JSX.Element {
	const { q } = Route.useSearch();

	return (
		<>
			<PageHeader
				eyebrow="Recherche par étiquette"
				title={
					<>
						Trouvez une{' '}
						<Text as="em" textStyle="emphasis" fontWeight={400}>
							photo
						</Text>
						.
					</>
				}
				description="Parcourez la taxonomie d'étiquettes ou recherchez un mot-clef pour explorer la bibliothèque par image."
			/>
			<Container maxW="container.xl" mt={8}>
				<SearchCombobox size="lg" />
				<Box mt={10} color="fg.muted">
					{q ? (
						<Text>Résultats pour « {q} » — à venir.</Text>
					) : (
						<Text>
							La taxonomie d'étiquettes s'affichera ici (à venir dans la
							prochaine itération).
						</Text>
					)}
				</Box>
			</Container>
		</>
	);
}
