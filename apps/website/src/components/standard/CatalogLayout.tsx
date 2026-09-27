import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	Icon,
	Text,
} from '@chakra-ui/react';
import { type FormEvent, type ReactNode, useRef } from 'react';
import { RiErrorWarningFill } from 'react-icons/ri';
import ContributeCta from '@/components/sections/ContributeCta';
import PageHeader from '@/components/sections/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { cardGridColumns } from '@/utils/grid';
import UIPagination, { hasSeveralPages, PaginationControl } from './Pagination';

const preventSubmit = (event: FormEvent) => event.preventDefault();

type CatalogLayoutProps = {
	eyebrow: string;
	title: ReactNode;
	description?: ReactNode;
	filters: ReactNode;
	totalDocs: number;
	limit: number;
	page: number;
	onPageChange: (page: number) => void;
	resultLabel: (count: number) => string;
	hasActiveFilters: boolean;
	onResetFilters: () => void;
	isEmpty: boolean;
	emptyTitle: string;
	emptyDescription: string;
	children: ReactNode;
};

/**
 * Shared shell for the searchable catalogue pages (/reports, /interviews):
 * filter row, a sticky results bar carrying the count and a compact
 * pagination, the card grid, then the full pagination at the bottom.
 */
function CatalogLayout({
	eyebrow,
	title,
	description,
	filters,
	totalDocs,
	limit,
	page,
	onPageChange,
	resultLabel,
	hasActiveFilters,
	onResetFilters,
	isEmpty,
	emptyTitle,
	emptyDescription,
	children,
}: CatalogLayoutProps) {
	const resultsRef = useRef<HTMLDivElement>(null);

	// Paging from the sticky bar or the bottom control lands on the first row
	// of the new page instead of wherever the user had scrolled to.
	const handlePageChange = (nextPage: number) => {
		onPageChange(nextPage);
		const results = resultsRef.current;
		if (results && results.getBoundingClientRect().top < 0) {
			results.scrollIntoView({ block: 'start' });
		}
	};

	return (
		<>
			<PageHeader eyebrow={eyebrow} title={title} description={description} />
			<Container maxW="container.xl" mt={8}>
				<Grid
					as="form"
					onSubmit={preventSubmit}
					templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
					gap={4}
					alignItems="start"
				>
					{filters}
				</Grid>
			</Container>
			<Box ref={resultsRef} mt={8} />
			<Box
				position="sticky"
				top={0}
				zIndex="sticky"
				borderY="solid 1px"
				borderColor="border.emphasized"
				bgColor="bg.muted"
			>
				<Container
					maxW="container.xl"
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					gap={4}
					minH="56px"
					py={2}
				>
					<Flex gap={3} alignItems="baseline" wrap="wrap">
						<Text>
							<Text as="span" color="primary.fg" fontWeight="bold">
								{totalDocs}
							</Text>{' '}
							{resultLabel(totalDocs)}
						</Text>
						{hasActiveFilters && (
							<Button
								variant="plain"
								size="sm"
								h="auto"
								p={0}
								color="fg.muted"
								textDecor="underline"
								onClick={onResetFilters}
							>
								Effacer les filtres
							</Button>
						)}
					</Flex>
					{hasSeveralPages(totalDocs, limit) && (
						<PaginationControl
							compact
							totalDocs={totalDocs}
							limit={limit}
							page={page}
							onPageChange={handlePageChange}
						/>
					)}
				</Container>
			</Box>
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns={cardGridColumns} gap={8}>
					{isEmpty ? (
						<EmptyState
							gridColumn={{ base: 'span 1', md: 'span 2', lg: 'span 3' }}
							size="lg"
							icon={<Icon as={RiErrorWarningFill} />}
							title={emptyTitle}
							description={emptyDescription}
						/>
					) : (
						children
					)}
				</Grid>
			</Container>
			<Box mt={16}>
				<UIPagination
					totalDocs={totalDocs}
					limit={limit}
					page={page}
					onPageChange={handlePageChange}
				/>
			</Box>
			<ContributeCta />
		</>
	);
}

export default CatalogLayout;
