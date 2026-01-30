import type { CollectionConfig } from "payload";

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

		// {
		// 	name: "relatedReports",
		// 	type: "join",
		// 	collection: "reports",
		// 	on: "tags",
		// 	label: "Photos associées",
		// 	admin: {
		// 		position: "sidebar",
		// 	},
		// },
		{
			name: "relatedChildTags",
			type: "join",
			collection: "tags",
			on: "parentId",
			label: "Étiquettes enfants",
			admin: {
				position: "sidebar",
				defaultColumns: ["name", "tagCategory"],
				condition: (data) => data.relatedChildTags?.docs.length > 0,
			},
		},
	],
};
