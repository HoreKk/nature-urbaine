import { queryOptions } from '@tanstack/react-query';
import { getPicturesByTag, getTagById } from '@/server/tags';

export const TAG_PICTURES_PAGE_SIZE = 24;

export const tagByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['tags', id],
		queryFn: () => getTagById({ data: id }),
	});

export const picturesByTagQueryOptions = (
	tagId: number,
	page: number,
	pageSize = TAG_PICTURES_PAGE_SIZE,
) => ({
	queryKey: ['pictures', 'by-tag', tagId, page] as const,
	queryFn: () => getPicturesByTag({ data: { tagId, page, pageSize } }),
});
