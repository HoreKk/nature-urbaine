import {
	AbsoluteCenter,
	Box,
	ButtonGroup,
	Container,
	IconButton,
	Pagination,
	Text,
} from '@chakra-ui/react';
import type { PaginatedDocs } from 'cms-payload';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface UIPaginationProps
	extends Pick<PaginatedDocs, 'totalDocs' | 'limit' | 'page'> {
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
			<Container
				maxW="container.xl"
				display="flex"
				justifyContent="space-between"
				py={8}
			>
				<Text mr={4} alignSelf="center">
					Affichage de {(currentPage - 1) * limit + 1} -{' '}
					{Math.min(currentPage * limit, totalDocs)} sur {totalDocs} résultats
				</Text>
				<AbsoluteCenter>
					<Pagination.Root
						count={totalDocs}
						pageSize={limit}
						page={currentPage}
						onPageChange={(newPage) => onPageChange(newPage.page)}
					>
						<ButtonGroup variant="ghost" size="sm">
							<Pagination.PrevTrigger asChild>
								<IconButton>
									<HiChevronLeft />
								</IconButton>
							</Pagination.PrevTrigger>

							<Pagination.Items
								render={(page) => (
									<IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
										{page.value}
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
				</AbsoluteCenter>
				<Box />
			</Container>
		</Box>
	);
};

export default UIPagination;
