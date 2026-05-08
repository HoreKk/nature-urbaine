import type { CollectionConfig } from "payload";
import { seedKeyField } from "../utils/seed-key-field";

export const Tags: CollectionConfig = {
	slug: "tags",
	labels: {
		singular: "Étiquette",
		plural: "Étiquettes",
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
			name: "tagCategory",
			type: "relationship",
			relationTo: "tag-categories",
			label: "Catégorie d'étiquette",
			required: true,
		},
		{
			type: "relationship",
			name: "parentId",
			label: "Étiquette parente",
			relationTo: "tags",
			hasMany: false,
		},
		{
			name: "relatedChildTags",
			type: "join",
			collection: "tags",
			on: "parentId",
			label: "Étiquettes enfants",
			admin: {
				defaultColumns: ["name", "tagCategory"],
				condition: (data) => data.relatedChildTags?.docs.length > 0,
			},
		},
	],
};
