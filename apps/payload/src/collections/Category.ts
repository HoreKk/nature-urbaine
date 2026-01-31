import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
	slug: "categories",
	labels: {
		singular: "Catégorie",
		plural: "Catégories",
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
			name: "relatedReports",
			type: "join",
			collection: "reports",
			on: "category",
			label: "Rapports associés",
		},
	],
};
