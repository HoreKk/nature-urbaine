import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Icon,
	Skeleton,
	Tag,
	Text,
	useFilter,
	useListCollection,
	Wrap,
} from '@chakra-ui/react';
import { useStore } from '@tanstack/react-form';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import z from 'zod';
import ReportCard from '@/components/reports/Card';
import ContributeCta from '@/components/sections/ContributeCta';
import UIPagination from '@/components/standard/Pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppForm } from '@/hooks/form-context';
import { getAllCategories } from '@/server/categories';
import { getReports } from '@/server/reports';

const LIMIT_PER_PAGE = 15;

export const Route = createFileRoute('/reports/')({
	component: RouteComponent,
	loader: async () => {
		const reports = await getReports({
			data: { page: 1, pageSize: LIMIT_PER_PAGE },
		});
		const categories = await getAllCategories();
		return { reports, categories };
	},
});

export const filterSchema = z.object({
	category: z.array(z.string()).optional(),
	search: z.string().optional(),
});

const defaultValues: z.input<typeof filterSchema> = {
	category: [],
	search: '',
};

function RouteComponent() {
	const { reports: loaderReports, categories } = Route.useLoaderData();

	const [page, setPage] = useState(1);

	const { contains } = useFilter({ sensitivity: 'base' });
	const { collection, filter } = useListCollection({
		initialItems: categories.map(({ name }) => ({ label: name, value: name })),
		filter: contains,
	});

	const filterForm = useAppForm({
		defaultValues,
		validators: { onChange: filterSchema },
	});

	const { search, ...restFormValues } = useStore(
		filterForm.store,
		(state) => state.values,
	);
	const debouncedSearch = useDebounce(search, 400);
	const formValues = { ...restFormValues, search: debouncedSearch };

	const { data, isEnabled, isFetching } = useQuery(
		queryOptions({
			queryKey: ['reports', page, formValues],
			queryFn: () =>
				getReports({
					data: { page, pageSize: LIMIT_PER_PAGE, filters: formValues },
				}),
			enabled: page !== 1 || filterForm.state.isDirty,
			initialData: loaderReports,
		}),
	);

	const filters = (
		Object.keys(formValues) as (keyof typeof formValues)[]
	).filter(
		(key) =>
			formValues[key] &&
			!(Array.isArray(formValues[key]) && formValues[key].length === 0),
	);

	const isLoading = isFetching || debouncedSearch !== search;
	const reports = isEnabled ? data.docs : loaderReports.docs;
	const totalDocs = isEnabled ? data.totalDocs : loaderReports.totalDocs;

	return (
		<>
			<Box py={12} bgColor="bg.emphasized">
				<Container maxW="container.xl">
					<Heading size="5xl" fontWeight="black">
						Reportages
					</Heading>
					<Text fontSize="xl" color="fg.muted">
						Plongez dans nos explorations photographiques urbaines
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
								placeholder="Rechercher par titre ou description"
							/>
						)}
					</filterForm.AppField>
				</Box>
				<Flex gap={4} alignItems="center">
					<filterForm.AppField name="category">
						{(field) => (
							<field.AutocompleteField
								label="Catégorie"
								placeholder="Sélectionnez une catégorie"
								collection={collection}
								filter={filter}
							/>
						)}
					</filterForm.AppField>
				</Flex>
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
					<Flex gap={2} alignItems="center">
						<Text>Filtres actifs :</Text>
						<Wrap gap={2}>
							{filters.map((key, index) => {
								const value = formValues[key as keyof typeof formValues];
								if (key === 'search' && value !== search) return null;
								return (
									<>
										<Tag.Root
											key={key}
											size="sm"
											colorPalette="blue"
											borderRadius="full"
										>
											<Tag.Label>{value}</Tag.Label>
											<Tag.EndElement>
												<Tag.CloseTrigger
													cursor="pointer"
													onClick={() =>
														filterForm.setFieldValue(
															key,
															Array.isArray(value) ? [] : '',
														)
													}
												/>
											</Tag.EndElement>
										</Tag.Root>
										{filters.length - 1 === index && (
											<Text
												key="clear-all"
												color="fg.muted"
												fontSize="sm"
												textDecor="underline"
												cursor="pointer"
												onClick={() => filterForm.reset()}
											>
												Effacer tous les filtres
											</Text>
										)}
									</>
								);
							})}
						</Wrap>
					</Flex>
					<Text>
						<Text as="span" color="fg.info" fontWeight="bold">
							{totalDocs}
						</Text>{' '}
						reportages trouvés
					</Text>
				</Container>
			</Box>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns="repeat(3, 1fr)" gap={8}>
					{reports.length === 0 ? (
						<EmptyState
							gridColumn="span 3"
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucun reportages trouvés"
							description="Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez."
						/>
					) : (
						reports.map((report) => (
							<Skeleton key={report.id} loading={isLoading}>
								<ReportCard report={report} />
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
