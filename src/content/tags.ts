export type TagPageContent = {
	eyebrow: string;
	resultLabel: string;
	description: string;
	emptyTitle: string;
	emptyDescription: string;
};

export const TAG_CONTENT: TagPageContent = {
	eyebrow: 'Étiquette',
	resultLabel: 'photo',
	description:
		'Toutes les photos taguées avec cette étiquette, à travers nos reportages.',
	emptyTitle: 'Aucune photo trouvée',
	emptyDescription:
		"Aucune photo n'est associée à cette étiquette pour le moment.",
};
