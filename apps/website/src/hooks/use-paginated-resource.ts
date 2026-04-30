import {
	queryOptions,
	type QueryKey,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { useState } from 'react';

type PaginatedResult<TDoc> = {
	docs: TDoc[];
	totalDocs?: number | null;
};

type PaginatedResourceQuery<TDoc> = {
	queryKey: QueryKey;
	queryFn: () => Promise<PaginatedResult<TDoc>>;
};

export function createPaginatedQueryOptions<
	TData extends PaginatedResult<unknown>,
>(query: { queryKey: QueryKey; queryFn: () => Promise<TData> }) {
	return queryOptions({ queryKey: query.queryKey, queryFn: query.queryFn });
}

export function toPaginatedResourceData<TDoc>(data: PaginatedResult<TDoc>) {
	return {
		docs: data.docs,
		totalDocs: data.totalDocs ?? 0,
	};
}

export function usePaginatedResource<TDoc, TContent>({
	getListQuery,
	content,
	initialPage = 1,
}: {
	getListQuery: (page: number) => PaginatedResourceQuery<TDoc>;
	content: TContent;
	initialPage?: number;
}) {
	const [page, setPage] = useState(initialPage);
	const query = getListQuery(page);

	const { data, isLoading } = useSuspenseQuery(
		createPaginatedQueryOptions(query),
	);
	const normalized = toPaginatedResourceData(data);

	return {
		docs: normalized.docs,
		totalDocs: normalized.totalDocs,
		isLoading,
		page,
		setPage,
		content,
	};
}
