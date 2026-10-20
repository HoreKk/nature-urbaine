import {
	Box,
	ButtonGroup,
	Container,
	IconButton,
	Pagination,
	Stack,
	Text,
} from '@chakra-ui/react';
import type { PaginatedDocs } from '@nature-urbaine/database';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface UIPaginationProps extends Pick<
	PaginatedDocs,
	'totalDocs' | 'limit' | 'page'
> {
	onPageChange: (page: number) => void;
}

const paginationTranslations = {
	rootLabel: 'Pagination',
	prevTriggerLabel: 'Page précédente',
	nextTriggerLabel: 'Page suivante',
	itemLabel: ({ page, totalPages }: { page: number; totalPages: number }) =>
		page === totalPages ? `Dernière page, page ${page}` : `Page ${page}`,
};

export const hasSeveralPages = (totalDocs: number, limit: number) =>
	totalDocs > limit;

export const PaginationControl = ({
	totalDocs,
	page,
	onPageChange,
	limit,
	compact = false,
}: UIPaginationProps & { compact?: boolean }) => (
	<Pagination.Root
		count={totalDocs}
		pageSize={limit}
		page={page || 1}
		onPageChange={(newPage) => onPageChange(newPage.page)}
		siblingCount={compact ? 0 : 1}
		translations={paginationTranslations}
	>
		<ButtonGroup variant="ghost" size={compact ? 'xs' : 'sm'}>
			<Pagination.PrevTrigger asChild>
				<IconButton>
					<HiChevronLeft />
				</IconButton>
			</Pagination.PrevTrigger>
			<Box display={compact ? { base: 'none', sm: 'contents' } : 'contents'}>
				<Pagination.Items
					render={(paginationItem) => (
						<IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
							{paginationItem.value}
						</IconButton>
					)}
				/>
			</Box>
			{compact && (
				<Pagination.Context>
					{({ page: current, totalPages }) => (
						<Text
							display={{ base: 'inline', sm: 'none' }}
							fontFamily="mono"
							fontSize="xs"
							color="fg.muted"
							px={1}
						>
							{current} / {totalPages}
						</Text>
					)}
				</Pagination.Context>
			)}
			<Pagination.NextTrigger asChild>
				<IconButton>
					<HiChevronRight />
				</IconButton>
			</Pagination.NextTrigger>
		</ButtonGroup>
	</Pagination.Root>
);

const UIPagination = ({
	totalDocs,
	page,
	onPageChange,
	limit,
}: UIPaginationProps) => {
	const currentPage = page || 1;

	if (!hasSeveralPages(totalDocs, limit)) return null;

	return (
		<Box
			position="relative"
			borderY="solid 1px"
			borderColor="border.emphasized"
			bgColor="bg.muted"
		>
			<Container maxW="container.xl" py={{ base: 5, md: 8 }}>
				<Stack
					direction={{ base: 'column-reverse', md: 'row' }}
					align="center"
					justify="space-between"
					gap={3}
				>
					<Text color="fg.muted" fontSize={{ base: 'sm', md: 'md' }}>
						Affichage de {(currentPage - 1) * limit + 1} -{' '}
						{Math.min(currentPage * limit, totalDocs)} sur {totalDocs} résultats
					</Text>
					<PaginationControl
						totalDocs={totalDocs}
						limit={limit}
						page={currentPage}
						onPageChange={onPageChange}
					/>
				</Stack>
			</Container>
		</Box>
	);
};

export default UIPagination;
