import {
	Box,
	Container,
	Flex,
	Grid,
	Icon,
	Skeleton,
	Tag,
	Text,
	useFilter,
	useListCollection,
	Wrap,
} from '@chakra-ui/react';
import { useStore } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDebounce } from '@uidotdev/usehooks';
import { useEffect, useRef } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import z from 'zod';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import ContributeCta from '@/components/sections/ContributeCta';
import PageHeader from '@/components/sections/PageHeader';
import UIPagination from '@/components/standard/Pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useAppForm } from '@/hooks/form-context';
import {
	REPORT_CATALOG_PAGE_SIZE,
	reportCatalogFilterSchema,
	reportCatalogQueryOptions,
} from '@/queries/report-catalog';
import { getAllCategories } from '@/server/categories';
import { findReportCatalog } from '@/server/report-catalog';
import { cardGridColumns } from '@/utils/grid';

const reportsSearchSchema = reportCatalogFilterSchema.extend({
	page: z.coerce.number<number>().int().min(1).optional(),
});

type ReportsSearch = z.infer<typeof reportsSearchSchema>;

export const Route = createFileRoute('/reports/')({
	validateSearch: reportsSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: async ({ deps }) => {
		const { page = 1, ...filter } = deps;
		const reports = await findReportCatalog({
			data: { page, pageSize: REPORT_CATALOG_PAGE_SIZE, filter },
		});
		const categories = await getAllCategories();
		return { reports, categories };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { reports: loaderReports, categories } = Route.useLoaderData();
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const page = search.page ?? 1;

	const { contains } = useFilter({ sensitivity: 'base' });
	const { collection, filter } = useListCollection({
		initialItems: categories.map(({ id, name }) => ({
			label: name,
			value: id.toString(),
		})),
		filter: contains,
	});

	const filterForm = useAppForm({
		defaultValues: {
			category: (search.category ?? []).map((id) => id.toString()),
			search: search.search ?? '',
		},
		validators: {
			onChange: z.object({
				category: z.array(z.string()),
				search: z.string(),
			}),
		},
	});

	const { search: searchInput, category: categoryInput } = useStore(
		filterForm.store,
		(state) => state.values,
	);
	const debouncedSearch = useDebounce(searchInput, 400);

	// Push debounced form state to URL (resets page to 1 when filters change).
	const lastPushedRef = useRef<{
		search: string;
		category: string[];
	} | null>(null);
	useEffect(() => {
		const next = { search: debouncedSearch, category: categoryInput };
		const last = lastPushedRef.current;
		if (
			last &&
			last.search === next.search &&
			last.category.length === next.category.length &&
			last.category.every((c, i) => c === next.category[i])
		) {
			return;
		}
		const currentSearch = search.search ?? '';
		const currentCategory = (search.category ?? []).map(String);
		if (
			next.search === currentSearch &&
			next.category.length === currentCategory.length &&
			next.category.every((c, i) => c === currentCategory[i])
		) {
			return;
		}
		lastPushedRef.current = next;
		navigate({
			search: (prev: ReportsSearch) => ({
				...prev,
				search: next.search || undefined,
				category:
					next.category.length > 0 ? next.category.map(Number) : undefined,
				page: undefined,
			}),
			replace: true,
		});
	}, [
		debouncedSearch,
		categoryInput,
		navigate,
		search.search,
		search.category,
	]);

	// Sync external URL changes (back/forward) back into the form.
	useEffect(() => {
		const urlSearchValue = search.search ?? '';
		if (urlSearchValue !== filterForm.state.values.search) {
			filterForm.setFieldValue('search', urlSearchValue);
		}
		const urlCategory = (search.category ?? []).map(String);
		const formCategory = filterForm.state.values.category;
		if (
			urlCategory.length !== formCategory.length ||
			!urlCategory.every((c, i) => c === formCategory[i])
		) {
			filterForm.setFieldValue('category', urlCategory);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search.search, search.category]);

	const queryFilter = {
		category: search.category,
		search: search.search,
		city: search.city,
	};

	const { data, isFetching } = useQuery({
		...reportCatalogQueryOptions(page, queryFilter),
		initialData: loaderReports,
	});

	const activeFilters = (
		Object.keys(queryFilter) as (keyof typeof queryFilter)[]
	).filter((key) => {
		const value = queryFilter[key];
		if (Array.isArray(value)) return value.length > 0;
		return Boolean(value);
	});

	const isLoading = isFetching || debouncedSearch !== searchInput;
	const reports = data.docs;
	const totalDocs = data.totalDocs;

	const handlePageChange = (nextPage: number) => {
		navigate({
			search: (prev: ReportsSearch) => ({
				...prev,
				page: nextPage > 1 ? nextPage : undefined,
			}),
		});
	};

	const clearFilter = (key: 'search' | 'category' | 'city') => {
		if (key === 'search') filterForm.setFieldValue('search', '');
		if (key === 'category') filterForm.setFieldValue('category', []);
		if (key === 'city') {
			navigate({
				search: (prev: ReportsSearch) => ({ ...prev, city: undefined }),
				replace: true,
			});
		}
	};

	const clearAll = () => {
		filterForm.reset();
		navigate({ search: {}, replace: true });
	};

	return (
		<>
			<PageHeader
				eyebrow="Catalogue"
				title={
					<>
						Reportages{' '}
						<Text as="em" textStyle="emphasis" fontWeight={400}>
							photos
						</Text>
						.
					</>
				}
				description="Les projets en France et à l'étranger, indexés et tagués. Plongez dans nos explorations photographiques urbaines."
			/>
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
								multiple
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
							{activeFilters.map((key, index) => {
								const value = queryFilter[key];
								const label = Array.isArray(value) ? value.join(', ') : value;
								return (
									<>
										<Tag.Root
											key={key}
											size="sm"
											colorPalette="primary"
											borderRadius="full"
										>
											<Tag.Label>{label}</Tag.Label>
											<Tag.EndElement>
												<Tag.CloseTrigger
													cursor="pointer"
													onClick={() => clearFilter(key)}
												/>
											</Tag.EndElement>
										</Tag.Root>
										{activeFilters.length - 1 === index && (
											<Text
												key="clear-all"
												color="fg.muted"
												fontSize="sm"
												textDecor="underline"
												cursor="pointer"
												onClick={clearAll}
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
						<Text as="span" color="primary.fg" fontWeight="bold">
							{totalDocs}
						</Text>{' '}
						reportages trouvés
					</Text>
				</Container>
			</Box>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns={cardGridColumns} gap={8}>
					{reports.length === 0 ? (
						<EmptyState
							gridColumn={{ base: 'span 1', md: 'span 2', lg: 'span 3' }}
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title="Aucun reportages trouvés"
							description="Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez."
						/>
					) : (
						reports.map((report) => (
							<Skeleton key={report.id} loading={isLoading}>
								<ProjectCard {...reportToProjectCardProps(report)} />
							</Skeleton>
						))
					)}
				</Grid>
			</Container>
			<Box mt={16}>
				<UIPagination
					totalDocs={totalDocs}
					limit={REPORT_CATALOG_PAGE_SIZE}
					page={page}
					onPageChange={handlePageChange}
				/>
			</Box>
			<ContributeCta />
		</>
	);
}
