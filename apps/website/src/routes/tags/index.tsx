import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import type { JSX } from 'react';
import z from 'zod';
import PageHeader from '@/components/sections/PageHeader';
import SearchCombobox from '@/components/standard/SearchCombobox';
import { TagSearchResults } from '@/components/tags/TagSearchResults';
import { TagTreeView } from '@/components/tags/TagTreeView';
import {
	getTagCategoriesWithRootCount,
	getTagTaxonomyStats,
} from '@/server/tags';

const tagsSearchSchema = z.object({
	q: z.string().optional(),
});

export const Route = createFileRoute('/tags/')({
	validateSearch: tagsSearchSchema,
	loader: async () => {
		const [categories, stats] = await Promise.all([
			getTagCategoriesWithRootCount(),
			getTagTaxonomyStats(),
		]);
		return { categories, stats };
	},
	component: RouteComponent,
});

function RouteComponent(): JSX.Element {
	const { categories, stats } = Route.useLoaderData();
	const { q } = Route.useSearch();
	const trimmed = q?.trim() ?? '';

	return (
		<>
			<PageHeader
				eyebrow="Recherche par étiquette"
				title={
					<>
						Trouver une{' '}
						<Text as="em" textStyle="emphasis" fontWeight={400}>
							photo
						</Text>
						.
					</>
				}
				description="Parcourez la taxonomie d'étiquettes ou recherchez un mot-clef pour explorer la bibliothèque par image."
			/>
			<Container maxW="container.xl" mt={8}>
				<SearchCombobox size="lg" focusOnMount />
				<Box mt={10}>
					{trimmed ? (
						<>
							<Heading textStyle="heading.sm" mb={4}>
								Résultats pour « {trimmed} »
							</Heading>
							<TagSearchResults query={trimmed} />
						</>
					) : (
						<>
							<Heading textStyle="heading.sm" mb={4}>
								Parcourir la taxonomie
							</Heading>
							<TagTreeView categories={categories} stats={stats} />
						</>
					)}
				</Box>
			</Container>
		</>
	);
}
