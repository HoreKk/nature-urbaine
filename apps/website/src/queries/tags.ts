import { queryOptions } from '@tanstack/react-query';
import {
	getChildTags,
	getPicturesByTagRecursive,
	getTagById,
} from '@/server/tags';

export const TAG_PICTURES_PAGE_SIZE = 24;

export const tagByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ['tags', id],
		queryFn: () => getTagById({ data: id }),
	});

export const childTagsQueryOptions = ({
	parentId,
	tagCategoryId,
}: {
	parentId: number | null;
	tagCategoryId: number | null;
}) =>
	queryOptions({
		queryKey: ['tags', 'children', { parentId, tagCategoryId }] as const,
		queryFn: () => getChildTags({ data: { parentId, tagCategoryId } }),
	});

export const picturesByTagQueryOptions = (
	tagId: number,
	page: number,
	pageSize = TAG_PICTURES_PAGE_SIZE,
) => ({
	queryKey: ['pictures', 'by-tag', tagId, page] as const,
	queryFn: () => getPicturesByTagRecursive({ data: { tagId, page, pageSize } }),
});
