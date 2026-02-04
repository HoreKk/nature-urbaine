import type { CollectionConfig } from "payload";
import { getSeasonFromDate } from "../utils/hooks";

export const Reports: CollectionConfig = {
	slug: "reports",
	labels: {
		singular: "Rapport",
		plural: "Rapports",
	},
	versions: {
		drafts: {
			validate: true,
		},
	},
	admin: {
		useAsTitle: "name",
	},
	fields: [
		{
			name: "thumbnail",
			type: "upload",
			label: "Vignette",
			relationTo: "media",
			required: true,
		},
		{
			name: "name",
			type: "text",
			label: "Nom",
			required: true,
		},
		{
			name: "slug",
			type: "text",
			label: "Slug",
			virtual: true,
			admin: {
				readOnly: true,
			},
			hooks: {
				afterRead: [
					({ siblingData }) => {
						siblingData.slug = siblingData.name
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-")
							.replace(/(^-|-$)/g, "");
					},
				],
			},
		},
		{
			name: "description",
			type: "textarea",
			label: "Description",
			required: true,
		},
		{
			name: "location",
			type: "point",
			label: "Emplacement",
		},
		{
			name: "relatedPictures",
			type: "join",
			label: "Photos associées",
			collection: "pictures",
			on: "report",
			admin: {
				defaultColumns: ["filename"],
			},
			hasMany: true,
		},
		{
			name: "category",
			type: "relationship",
			relationTo: "categories",
			label: "Catégorie",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "date",
			type: "date",
			label: "Date du rapport",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "season",
			type: "select",
			label: "Saison",
			options: [
				{ label: "Printemps", value: "spring" },
				{ label: "Été", value: "summer" },
				{ label: "Automne", value: "autumn" },
				{ label: "Hiver", value: "winter" },
			],
			admin: { readOnly: true, position: "sidebar" },
			hooks: {
				beforeChange: [
					({ siblingData }) => {
						siblingData.season = undefined;
					},
				],
				afterRead: [getSeasonFromDate],
			},
		},
		{
			name: "cityStratum",
			type: "text",
			label: "Strate de la ville",
		},
		{
			name: "nbPopulations",
			type: "number",
			label: "Nombre d'habitants",
		},
	],
};
