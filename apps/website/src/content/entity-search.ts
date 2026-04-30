import type { EntityKind, FieldKind } from '@/server/entity-search/kinds';

export type EntitySearchContent = {
	eyebrow: string;
	resultLabel: string;
	description: string;
	emptyTitle: string;
	emptyDescription: string;
};

export type FieldSearchContent = {
	eyebrow: string;
	description: string;
	emptyTitle: string;
	emptyDescription: string;
};

export const ENTITY_CONTENT: Record<EntityKind, EntitySearchContent> = {
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

export const FIELD_CONTENT: Record<FieldKind, FieldSearchContent> = {
	city: {
		eyebrow: 'Lieu',
		description:
			'Tous les reportages photographiques recensés dans cette ville.',
		emptyTitle: 'Aucun reportage trouvé',
		emptyDescription:
			"Aucun reportage n'est rattaché à cette ville pour le moment.",
	},
};
