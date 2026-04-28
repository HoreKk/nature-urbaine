import {
	Box,
	Container,
	Grid,
	Heading,
	Icon,
	Skeleton,
	Tag,
	Text,
	Wrap,
} from '@chakra-ui/react';
import type { PaginatedDocs } from '@nature-urbaine/database';
import { useStore } from '@tanstack/react-form';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import type z from 'zod';
import ProjectCard from '@/components/cards/ProjectCard';
import { interviewToProjectCardProps } from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import UIPagination from '@/components/standard/Pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppForm } from '@/hooks/form-context';
import type { SafeInterview } from '@/server/interviews';
import { getInterviews, interviewFilterSchema } from '@/server/interviews';

const LIMIT_PER_PAGE = 12;

export const Route = createFileRoute('/interviews/')({
	component: RouteComponent,
	loader: async () => {
		const interviews = await getInterviews({
			data: { page: 1, pageSize: LIMIT_PER_PAGE },
		});
		return { interviews };
	},
});

const defaultValues: z.input<typeof interviewFilterSchema> = {
	search: '',
};

function RouteComponent() {
	const { interviews: loaderInterviews } = Route.useLoaderData() as {
		interviews: PaginatedDocs<SafeInterview>;
	};

	const [page, setPage] = useState(1);

	const filterForm = useAppForm({
		defaultValues,
		validators: { onChange: interviewFilterSchema },
	});

	const { search } = useStore(filterForm.store, (state) => state.values);
	const debouncedSearch = useDebounce(search, 400);
	const formValues = { search: debouncedSearch };

	const { data, isEnabled, isFetching } = useQuery(
		queryOptions({
			queryKey: ['interviews', page, formValues],
			queryFn: () =>
				getInterviews({
					data: { page, pageSize: LIMIT_PER_PAGE, filters: formValues },
				}),
			enabled: page !== 1 || filterForm.state.isDirty,
			initialData: loaderInterviews,
		}),
	);

	const hasActiveSearch = debouncedSearch && debouncedSearch.length > 0;

	const isLoading = isFetching || debouncedSearch !== search;
	const interviews = isEnabled ? data.docs : loaderInterviews.docs;
	const totalDocs = isEnabled ? data.totalDocs : loaderInterviews.totalDocs;

	return (
		<>
			<Box py={12} bgColor="bg.emphasized">
				<Container maxW="container.xl">
					<Heading size="5xl" fontWeight="black">
						Interviews
					</Heading>
					<Text fontSize="xl" color="fg.muted">
						Des rencontres avec des acteurs de la nature urbaine
					</Text>
				</Container>
			</Box>

			<Container
				as="form"
				maxW="container.xl"
				mt={8}
				display="flex"
				flexDirection="column"
				gap={4}
			>
				<Box w="35%">
					<filterForm.AppField name="search">
						{(field) => (
							<field.TextField
								label="Recherche"
								placeholder="Rechercher par titre, ville ou interviewé"
							/>
						)}
					</filterForm.AppField>
				</Box>
			</Container>

			<Box
				borderY="solid 1px"
				borderColor="border.emphasized"
				bgColor="bg.muted"
				mt={8}
			>
				<Container
					maxW="container.xl"
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					py={4}
				>
					<Wrap gap={2} alignItems="center">
						<Text>Filtres actifs :</Text>
						{hasActiveSearch ? (
							<Tag.Root size="sm" colorPalette="primary" borderRadius="full">
								<Tag.Label>{debouncedSearch}</Tag.Label>
								<Tag.EndElement>
									<Tag.CloseTrigger
										cursor="pointer"
										onClick={() => filterForm.setFieldValue('search', '')}
									/>
								</Tag.EndElement>
							</Tag.Root>
						) : (
							<Text color="fg.muted" fontSize="sm">
								Aucun
							</Text>
						)}
					</Wrap>
					<Text>
						<Text as="span" color="primary.accent" fontWeight="bold">
							{totalDocs}
						</Text>{' '}
						interview{totalDocs !== 1 ? 's' : ''} trouvée
						{totalDocs !== 1 ? 's' : ''}
					</Text>
				</Container>
			</Box>

			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns="repeat(3, 1fr)" gap={8}>
					{interviews.length === 0 ? (
						<EmptyState
							gridColumn="span 3"
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucune interview trouvée"
							description="Essayez d'ajuster votre recherche pour trouver ce que vous cherchez."
						/>
					) : (
						interviews.map((interview) => (
							<Skeleton key={interview.id} loading={isLoading}>
								<ProjectCard {...interviewToProjectCardProps(interview)} />
							</Skeleton>
						))
					)}
				</Grid>
			</Container>

			<Box mt={16}>
				<UIPagination
					totalDocs={totalDocs}
					limit={LIMIT_PER_PAGE}
					page={page}
					onPageChange={setPage}
				/>
			</Box>

			<ContributeCta />
		</>
	);
}
