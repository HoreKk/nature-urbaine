import type { PaginatedDocs } from '@nature-urbaine/database';
import { getCategoryById } from '@/server/categories';
import { getReports, type AugmentedReport } from '@/server/reports';
import {
	getPicturesByTag,
	getTagById,
	type PictureWithReport,
} from '@/server/tags';
import type { EntityKind, FieldKind } from './kinds';

export const LIMITS_BY_ENTITY: Record<EntityKind, number> = {
	category: 15,
	tag: 24,
};

export const LIMITS_BY_FIELD: Record<FieldKind, number> = {
	city: 15,
};

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

export function getCategoryListQuery({
	id,
	page,
}: {
	id: number;
	page: number;
}): {
	queryKey: readonly ['entity', 'category', number, 'reports', number];
	queryFn: () => Promise<PaginatedDocs<AugmentedReport>>;
} {
	return {
		queryKey: ['entity', 'category', id, 'reports', page],
		queryFn: () =>
			getReports({
				data: {
					page,
					pageSize: LIMITS_BY_ENTITY.category,
					filters: { category: [id] },
				},
			}),
	};
}

export function getTagListQuery({ id, page }: { id: number; page: number }): {
	queryKey: readonly ['entity', 'tag', number, 'pictures', number];
	queryFn: () => Promise<PaginatedDocs<PictureWithReport>>;
} {
	return {
		queryKey: ['entity', 'tag', id, 'pictures', page],
		queryFn: () =>
			getPicturesByTag({
				data: { tagId: id, page, pageSize: LIMITS_BY_ENTITY.tag },
			}),
	};
}

export function getEntityListQuery({
	kind,
	id,
	page,
}: {
	kind: EntityKind;
	id: number;
	page: number;
}): {
	queryKey: readonly [string, string, number, string, number];
	queryFn: () => Promise<
		PaginatedDocs<AugmentedReport> | PaginatedDocs<PictureWithReport>
	>;
} {
	if (kind === 'tag') return getTagListQuery({ id, page });
	return getCategoryListQuery({ id, page });
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

export function getCityFieldListQuery({
	value,
	page,
}: {
	value: string;
	page: number;
}): {
	queryKey: readonly ['field', 'city', string, 'reports', number];
	queryFn: () => Promise<PaginatedDocs<AugmentedReport>>;
} {
	return {
		queryKey: ['field', 'city', value, 'reports', page],
		queryFn: () =>
			getReports({
				data: {
					page,
					pageSize: LIMITS_BY_FIELD.city,
					filters: { city: value },
				},
			}),
	};
}

export function getFieldListQuery({
	field,
	value,
	page,
}: {
	field: FieldKind;
	value: string;
	page: number;
}): {
	queryKey: readonly ['field', 'city', string, 'reports', number];
	queryFn: () => Promise<PaginatedDocs<AugmentedReport>>;
} {
	if (field === 'city') {
		return getCityFieldListQuery({ value, page });
	}

	return getCityFieldListQuery({ value, page });
}
