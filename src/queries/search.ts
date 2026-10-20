import { queryOptions } from '@tanstack/react-query';
import { getSearchResults } from '@/server/search';

export const searchQueryOptions = (searchTerm: string) =>
	queryOptions({
		queryKey: ['search', searchTerm],
		queryFn: () => getSearchResults({ data: { searchTerm } }),
		enabled: searchTerm.length > 0,
	});
