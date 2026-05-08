import type { CollectionConfig } from "payload";
import { seedKeyField } from "../utils/seed-key-field";

export const TagCategories: CollectionConfig = {
	slug: "tag-categories",
	labels: {
		singular: "Catégorie d'étiquette",
		plural: "Catégories d'étiquettes",
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		seedKeyField,
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
};
