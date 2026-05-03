import { queryOptions } from '@tanstack/react-query';
import {
	getAllCategories,
	getCategoryById,
	getLibraryStats,
} from '@/server/categories';

export const categoriesQueryOptions = () =>
	queryOptions({
		queryKey: ['categories'],
		queryFn: () => getAllCategories(),
	});

export const libraryStatsQueryOptions = () =>
	queryOptions({
		queryKey: ['library-stats'],
		queryFn: () => getLibraryStats(),
	});

export const categoryByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['categories', id],
		queryFn: () => getCategoryById({ data: id }),
	});
