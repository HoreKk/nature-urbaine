import type { PaginatedDocs } from '@nature-urbaine/database';
import { getCategoryById } from '@/server/categories';
import {
	getPicturesByTag,
	getTagById,
	type PictureWithReport,
} from '@/server/tags';
import type { EntityKind, FieldKind } from './kinds';

export const TAG_PICTURES_PAGE_SIZE = 24;

export async function getEntityByKind({
	kind,
	id,
}: {
	kind: EntityKind;
	id: number;
}) {
	switch (kind) {
		case 'category':
			return getCategoryById({ data: id });
		case 'tag':
			return getTagById({ data: id });
	}
}

export function getTagListQuery({ id, page }: { id: number; page: number }): {
	queryKey: readonly ['entity', 'tag', number, 'pictures', number];
	queryFn: () => Promise<PaginatedDocs<PictureWithReport>>;
} {
	return {
		queryKey: ['entity', 'tag', id, 'pictures', page],
		queryFn: () =>
			getPicturesByTag({
				data: { tagId: id, page, pageSize: TAG_PICTURES_PAGE_SIZE },
			}),
	};
}

export async function getFieldByKind({
	field,
	value,
}: {
	field: FieldKind;
	value: string;
}) {
	switch (field) {
		case 'city':
			return { label: value };
	}
}
