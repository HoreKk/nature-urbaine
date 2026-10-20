import type { CollectionConfig } from "payload";
import { seedKeyField } from "../utils/seed-key-field";

export const Categories: CollectionConfig = {
	slug: "categories",
	// Public catalog data: the website reads it without a user (Payload 4
	// enforces access on the Local API by default).
	access: {
		read: () => true,
	},
	labels: {
		singular: "Catégorie",
		plural: "Catégories",
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
			name: "relatedReports",
			type: "join",
			collection: "reports",
			on: "category",
			label: "Rapports associés",
		},
	],
	versions: false,
	authorship: false,
};
