import type { CollectionConfig } from "payload";

export const TagCategories: CollectionConfig = {
	slug: "tag-categories",
	// Public catalog data: the website reads it without a user (Payload 4
	// enforces access on the Local API by default).
	access: {
		read: () => true,
	},
	labels: {
		singular: "Catégorie d'étiquette",
		plural: "Catégories d'étiquettes",
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		{
			name: "name",
			type: "text",
			label: "Nom",
			required: true,
		},
		{
			name: "description",
			type: "textarea",
			label: "Description",
		},
		{
			name: "relatedTags",
			type: "join",
			collection: "tags",
			on: "tagCategory",
			label: "Tags associés",
			defaultLimit: 0,
		},
	],
	versions: false,
	authorship: false,
};
