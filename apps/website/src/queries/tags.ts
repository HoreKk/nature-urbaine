import { queryOptions } from '@tanstack/react-query';
import { getPicturesByTag, getTagById } from '@/server/tags';

export const tagByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['tags', id],
		queryFn: () => getTagById({ data: id }),
	});

export const picturesByTagQueryOptions = (
	tagId: number,
	page: number,
	pageSize = 20,
) =>
	queryOptions({
		queryKey: ['pictures', 'by-tag', tagId, page],
		queryFn: () => getPicturesByTag({ data: { tagId, page, pageSize } }),
	});
