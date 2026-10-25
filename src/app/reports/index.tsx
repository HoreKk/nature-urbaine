import { Skeleton, Text, useFilter, useListCollection } from '@chakra-ui/react';
import { useStore } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	createFileRoute,
	redirect,
	stripSearchParams,
	useNavigate,
	useRouterState,
} from '@tanstack/react-router';
import z from 'zod';
import ProjectCard from '@/components/cards/ProjectCard';
import { reportToProjectCardProps } from '@/components/cards/projectCardProps';
import CatalogLayout from '@/components/standard/CatalogLayout';
import { useAppForm } from '@/hooks/form-context';
import { useUrlSyncedFilters } from '@/hooks/use-url-synced-filters';
import { categoriesQueryOptions } from '@/queries/categories';
import {
	REPORT_CATALOG_PAGE_SIZE,
	REPORT_CATALOG_SORTS,
	reportCatalogFilterSchema,
	reportCatalogQueryOptions,
	type ReportCatalogSort,
} from '@/queries/report-catalog';

// A malformed URL param falls back to its default instead of failing the page.
const reportsSearchSchema = z.object({
	category: reportCatalogFilterSchema.shape.category
		.unwrap()
		.default([])
		.catch([]),
	search: reportCatalogFilterSchema.shape.search.catch(undefined),
	city: reportCatalogFilterSchema.shape.city.catch(undefined),
	sort: reportCatalogFilterSchema.shape.sort.catch(undefined),
	page: z.coerce.number<number>().int().min(1).default(1).catch(1),
});

const searchDefaults = { category: [], page: 1 };

type ReportsSearch = z.infer<typeof reportsSearchSchema>;

export const Route = createFileRoute('/reports/')({
	validateSearch: reportsSearchSchema,
	search: { middlewares: [stripSearchParams(searchDefaults)] },
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const { page, ...filter } = deps;
		const [reports] = await Promise.all([
			context.queryClient.ensureQueryData(
				reportCatalogQueryOptions(page, filter),
			),
			context.queryClient.ensureQueryData(categoriesQueryOptions()),
		]);
		if (page > 1 && page > reports.totalPages) {
			throw redirect({
				to: '/reports',
				search: {
					...deps,
					page: reports.totalPages > 1 ? reports.totalPages : undefined,
				},
				replace: true,
			});
		}
	},
	component: RouteComponent,
});

const filterFormSchema = z.object({
	search: z.string().max(200),
	category: z.array(z.string()),
	sort: z.enum(REPORT_CATALOG_SORTS).or(z.literal('')),
});

const sortOptions: { label: string; value: ReportCatalogSort }[] = [
	{ label: 'Publications récentes en premier', value: 'recent' },
	{ label: 'Chronologie des reportages', value: 'chronological' },
	{ label: 'Ville (A-Z)', value: 'city' },
];

type FilterFormValues = z.infer<typeof filterFormSchema>;

const toFormValues = (search: ReportsSearch): FilterFormValues => ({
	search: search.search ?? '',
	category: search.category.map(String),
	sort: search.sort ?? '',
});

function RouteComponent() {
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const { page } = search;

	const { contains } = useFilter({ sensitivity: 'base' });
	const { collection, filter } = useListCollection({
		initialItems: categories.map(({ id, name }) => ({
			label: name,
			value: id.toString(),
		})),
		filter: contains,
	});

	const urlValues = toFormValues(search);
	const filterForm = useAppForm({
		defaultValues: urlValues,
		validators: { onChange: filterFormSchema },
	});
	const formValues = useStore(filterForm.store, (state) => state.values);

	const { isPending } = useUrlSyncedFilters({
		formValues,
		urlValues,
		debouncedKeys: ['search'],
		setFormValues: (values) => {
			filterForm.setFieldValue('search', values.search);
			filterForm.setFieldValue('category', values.category);
			filterForm.setFieldValue('sort', values.sort);
		},
		onCommit: (values) =>
			navigate({
				search: (prev: ReportsSearch) => ({
					...prev,
					search: values.search || undefined,
					category:
						values.category.length > 0
							? values.category.map(Number)
							: undefined,
					sort: values.sort || undefined,
					page: undefined,
				}),
				replace: true,
				resetScroll: false,
			}),
	});

	const queryFilter = {
		category: search.category,
		search: search.search,
		city: search.city,
		sort: search.sort,
	};

	const { data } = useSuspenseQuery(
		reportCatalogQueryOptions(page, queryFilter),
	);
	const isNavigating = useRouterState({ select: (state) => state.isLoading });

	const hasActiveFilters = Boolean(
		search.search || search.city || search.category?.length,
	);

	return (
		<CatalogLayout
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
			filters={
				<>
					<filterForm.AppField name="search">
						{(field) => (
							<field.TextField
								label="Recherche"
								placeholder="Rechercher par titre ou description"
							/>
						)}
					</filterForm.AppField>
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
					<filterForm.AppField name="sort">
						{(field) => (
							<field.SelectField
								label="Trier par"
								placeholder="Sélectionnez un tri"
								options={sortOptions}
							/>
						)}
					</filterForm.AppField>
				</>
			}
			filterColumns={3}
			totalDocs={data.totalDocs}
			isEmpty={data.docs.length === 0}
			limit={REPORT_CATALOG_PAGE_SIZE}
			page={page}
			onPageChange={(nextPage) =>
				navigate({
					search: (prev: ReportsSearch) => ({
						...prev,
						page: nextPage > 1 ? nextPage : undefined,
					}),
					resetScroll: false,
				})
			}
			resultLabel={(count) =>
				count > 1 ? 'reportages trouvés' : 'reportage trouvé'
			}
			hasActiveFilters={hasActiveFilters}
			onResetFilters={() =>
				navigate({ search: {}, replace: true, resetScroll: false })
			}
			emptyTitle="Aucun reportage trouvé"
			emptyDescription="Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez."
		>
			{data.docs.map((report) => (
				<Skeleton key={report.id} loading={isNavigating || isPending}>
					<ProjectCard {...reportToProjectCardProps(report)} />
				</Skeleton>
			))}
		</CatalogLayout>
	);
}
