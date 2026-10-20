import { Skeleton, Text, useFilter, useListCollection } from '@chakra-ui/react';
import { useStore } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	createFileRoute,
	redirect,
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
	reportCatalogFilterSchema,
	reportCatalogQueryOptions,
} from '@/queries/report-catalog';

const reportsSearchSchema = reportCatalogFilterSchema.extend({
	page: z.coerce.number<number>().int().min(1).optional(),
});

type ReportsSearch = z.infer<typeof reportsSearchSchema>;

export const Route = createFileRoute('/reports/')({
	validateSearch: reportsSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const { page = 1, ...filter } = deps;
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
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

const toFormValues = (search: ReportsSearch): FilterFormValues => ({
	search: search.search ?? '',
	category: (search.category ?? []).map(String),
});

function RouteComponent() {
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions());
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

	const urlValues = toFormValues(search);
	const filterForm = useAppForm({
		defaultValues: urlValues,
		validators: { onChange: filterFormSchema },
	});
	const formValues = useStore(filterForm.store, (state) => state.values);

	const { isPending } = useUrlSyncedFilters({
		formValues,
		urlValues,
		setFormValues: (values) => {
			filterForm.setFieldValue('search', values.search);
			filterForm.setFieldValue('category', values.category);
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
				</>
			}
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
