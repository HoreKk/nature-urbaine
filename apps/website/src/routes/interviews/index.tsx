import { Skeleton, Text } from '@chakra-ui/react';
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
import { interviewToProjectCardProps } from '@/components/cards/projectCardProps';
import CatalogLayout from '@/components/standard/CatalogLayout';
import { useAppForm } from '@/hooks/form-context';
import { useUrlSyncedFilters } from '@/hooks/use-url-synced-filters';
import {
	INTERVIEWS_PAGE_SIZE,
	interviewFilterSchema,
	interviewsQueryOptions,
} from '@/queries/interviews';

const interviewsSearchSchema = interviewFilterSchema.extend({
	page: z.coerce.number<number>().int().min(1).optional(),
});

type InterviewsSearch = z.infer<typeof interviewsSearchSchema>;

export const Route = createFileRoute('/interviews/')({
	validateSearch: interviewsSearchSchema,
	loaderDeps: ({ search }) => search,
	loader: async ({ context, deps }) => {
		const { page = 1, ...filters } = deps;
		const interviews = await context.queryClient.ensureQueryData(
			interviewsQueryOptions(page, filters),
		);
		if (page > 1 && page > interviews.totalPages) {
			throw redirect({
				to: '/interviews',
				search: {
					...deps,
					page: interviews.totalPages > 1 ? interviews.totalPages : undefined,
				},
				replace: true,
			});
		}
	},
	component: RouteComponent,
});

const filterFormSchema = z.object({
	search: z.string().max(200),
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

const toFormValues = (search: InterviewsSearch): FilterFormValues => ({
	search: search.search ?? '',
});

function RouteComponent() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const page = search.page ?? 1;

	const urlValues = toFormValues(search);
	const filterForm = useAppForm({
		defaultValues: urlValues,
		validators: { onChange: filterFormSchema },
	});
	const formValues = useStore(filterForm.store, (state) => state.values);

	const { isPending } = useUrlSyncedFilters({
		formValues,
		urlValues,
		setFormValues: (values) =>
			filterForm.setFieldValue('search', values.search),
		onCommit: (values) =>
			navigate({
				search: (prev: InterviewsSearch) => ({
					...prev,
					search: values.search || undefined,
					page: undefined,
				}),
				replace: true,
				resetScroll: false,
			}),
	});

	const { data } = useSuspenseQuery(
		interviewsQueryOptions(page, { search: search.search }),
	);
	const isNavigating = useRouterState({ select: (state) => state.isLoading });

	return (
		<CatalogLayout
			eyebrow="À la une"
			title={
				<>
					À la rencontre des{' '}
					<Text as="em" textStyle="emphasis" fontWeight={400}>
						faiseurs
					</Text>
					.
				</>
			}
			description="Des rencontres avec les paysagistes, urbanistes et maîtres d'œuvre qui dessinent le paysage urbain."
			filters={
				<filterForm.AppField name="search">
					{(field) => (
						<field.TextField
							label="Recherche"
							placeholder="Rechercher par titre, ville ou interviewé"
						/>
					)}
				</filterForm.AppField>
			}
			totalDocs={data.totalDocs}
			isEmpty={data.docs.length === 0}
			limit={INTERVIEWS_PAGE_SIZE}
			page={page}
			onPageChange={(nextPage) =>
				navigate({
					search: (prev: InterviewsSearch) => ({
						...prev,
						page: nextPage > 1 ? nextPage : undefined,
					}),
					resetScroll: false,
				})
			}
			resultLabel={(count) =>
				count > 1 ? 'interviews trouvées' : 'interview trouvée'
			}
			hasActiveFilters={Boolean(search.search)}
			onResetFilters={() =>
				navigate({ search: {}, replace: true, resetScroll: false })
			}
			emptyTitle="Aucune interview trouvée"
			emptyDescription="Essayez d'ajuster votre recherche pour trouver ce que vous cherchez."
		>
			{data.docs.map((interview) => (
				<Skeleton key={interview.id} loading={isNavigating || isPending}>
					<ProjectCard {...interviewToProjectCardProps(interview)} />
				</Skeleton>
			))}
		</CatalogLayout>
	);
}
