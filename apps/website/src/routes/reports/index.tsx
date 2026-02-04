import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Skeleton,
	Text,
	useFilter,
	useListCollection,
} from '@chakra-ui/react';
import { useStore } from '@tanstack/react-form';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';
import ReportCard from '@/components/reports/Card';
import ContributeCta from '@/components/sections/ContributeCta';
import UIPagination from '@/components/standard/Pagination';
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
	search: undefined,
};

function RouteComponent() {
	const { reports: loaderReports, categories } = Route.useLoaderData();

	const [page, setPage] = useState(1);

	const { contains } = useFilter({ sensitivity: 'base' });
	const { collection, filter } = useListCollection({
		initialItems: categories.map(({ name }) => ({
			label: name,
			value: name,
		})),
		filter: contains,
	});

	const filterForm = useAppForm({
		defaultValues,
		validators: { onChange: filterSchema },
	});

	const formValues = useStore(filterForm.store, (state) => state.values);

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
				gap={6}
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
					<Flex gap={2}>
						Filtres actifs :<Flex gap={2}></Flex>
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
					{reports.map((report) => (
						<Skeleton key={report.id} loading={isFetching}>
							<ReportCard report={report} />
						</Skeleton>
					))}
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
