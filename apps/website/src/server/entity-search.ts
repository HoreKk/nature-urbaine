import type { PaginatedDocs } from '@nature-urbaine/database';
import { getCategoryById } from './categories';
import { getReports, type AugmentedReport } from './reports';
import { getPicturesByTag, getTagById, type PictureWithReport } from './tags';

export const ENTITY_KINDS = ['category', 'tag'] as const;
export type EntityKind = (typeof ENTITY_KINDS)[number];

export const FIELD_KINDS = ['city'] as const;
export type FieldKind = (typeof FIELD_KINDS)[number];

export const LIMITS_BY_ENTITY: Record<EntityKind, number> = {
	category: 15,
	tag: 24,
};

export const LIMITS_BY_FIELD: Record<FieldKind, number> = {
	city: 15,
};

export const ENTITY_COPY: Record<
	EntityKind,
	{
		eyebrow: string;
		resultLabel: string;
		description: string;
		emptyTitle: string;
		emptyDescription: string;
	}
> = {
	category: {
		eyebrow: 'Catégorie',
		resultLabel: 'reportage',
		description: 'Plongez dans nos explorations photographiques urbaines.',
		emptyTitle: 'Aucun reportages trouvés',
		emptyDescription:
			"Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez.",
	},
	tag: {
		eyebrow: 'Étiquette',
		resultLabel: 'photo',
		description:
			'Toutes les photos taguées avec cette étiquette, à travers nos reportages.',
		emptyTitle: 'Aucune photo trouvée',
		emptyDescription:
			"Aucune photo n'est associée à cette étiquette pour le moment.",
	},
};

export const FIELD_COPY: Record<
	FieldKind,
	{
		eyebrow: string;
		description: string;
		emptyTitle: string;
		emptyDescription: string;
	}
> = {
	city: {
		eyebrow: 'Lieu',
		description:
			'Tous les reportages photographiques recensés dans cette ville.',
		emptyTitle: 'Aucun reportage trouvé',
		emptyDescription:
			"Aucun reportage n'est rattaché à cette ville pour le moment.",
	},
};

export function isEntityKind(kind: string): kind is EntityKind {
	return ENTITY_KINDS.includes(kind as EntityKind);
}

export function isFieldKind(kind: string): kind is FieldKind {
	return FIELD_KINDS.includes(kind as FieldKind);
}

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
