import { Box, Container, Grid, type GridProps } from '@chakra-ui/react';
import type { JSX, ReactNode } from 'react';
import ContributeCta from '@/components/sections/ContributeCta';
import PageHeader from '@/components/sections/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import UIPagination from './Pagination';

type PaginatedListLayoutProps = {
	eyebrow: string;
	title: ReactNode;
	description?: ReactNode;
	totalDocs: number;
	limit: number;
	page: number;
	onPageChange: (page: number) => void;
	gridTemplateColumns: GridProps['templateColumns'];
	gridGap?: GridProps['gap'];
	isEmpty: boolean;
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon?: ReactNode;
	emptyGridColumn?: GridProps['gridColumn'];
	children: ReactNode;
	bottomContent?: ReactNode;
};

function PaginatedListLayout({
	eyebrow,
	title,
	description,
	totalDocs,
	limit,
	page,
	onPageChange,
	gridTemplateColumns,
	gridGap = 8,
	isEmpty,
	emptyTitle,
	emptyDescription,
	emptyIcon,
	emptyGridColumn = 'span 3',
	children,
	bottomContent,
}: PaginatedListLayoutProps): JSX.Element {
	return (
		<>
			<PageHeader eyebrow={eyebrow} title={title} description={description} />
			<Container maxW="container.xl" mt={10}>
				<Grid templateColumns={gridTemplateColumns} gap={gridGap}>
					{isEmpty ? (
						<EmptyState
							gridColumn={emptyGridColumn}
							size="lg"
							icon={emptyIcon}
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
					onPageChange={onPageChange}
				/>
			</Box>
			<ContributeCta />
			{bottomContent}
		</>
	);
}

export default PaginatedListLayout;
