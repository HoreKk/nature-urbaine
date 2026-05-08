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

const UIPagination = ({
	totalDocs,
	page,
	onPageChange,
	limit,
}: UIPaginationProps) => {
	const currentPage = page || 1;

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
					<Pagination.Root
						count={totalDocs}
						pageSize={limit}
						page={currentPage}
						onPageChange={(newPage) => onPageChange(newPage.page)}
						siblingCount={1}
					>
						<ButtonGroup variant="ghost" size="sm">
							<Pagination.PrevTrigger asChild>
								<IconButton>
									<HiChevronLeft />
								</IconButton>
							</Pagination.PrevTrigger>

							<Pagination.Items
								render={(paginationItem) => (
									<IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
										{paginationItem.value}
									</IconButton>
								)}
							/>

							<Pagination.NextTrigger asChild>
								<IconButton>
									<HiChevronRight />
								</IconButton>
							</Pagination.NextTrigger>
						</ButtonGroup>
					</Pagination.Root>
				</Stack>
			</Container>
		</Box>
	);
};

export default UIPagination;
