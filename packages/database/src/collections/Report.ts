import type { CollectionConfig } from "payload";
import { getSeasonFromDate } from "../utils/hooks";
import { seedKeyField } from "../utils/seed-key-field";

export const CITY_STRATUM_OPTIONS = [
	{ label: "Moins de 500 hab.", value: "moins-de-500" },
	{ label: "De 500 à 2 000 hab.", value: "500-a-2000" },
	{ label: "De 2 000 à 3 500 hab.", value: "2000-a-3500" },
	{ label: "De 3 500 à 10 000 hab.", value: "3500-a-10000" },
	{ label: "De 10 000 à 30 000 hab.", value: "10000-a-30000" },
	{ label: "De 30 000 à 100 000 hab.", value: "30000-a-100000" },
	{ label: "Plus de 100 000 hab.", value: "plus-de-100000" },
] as const;

export const Reports: CollectionConfig = {
	slug: "reports",
	labels: {
		singular: "Reportage",
		plural: "Reportages",
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
		seedKeyField,
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
			name: "projectName",
			type: "text",
			label: "Nom du projet",
		},
		{
			name: "locationDetails",
			type: "group",
			label: "Localisation",
			fields: [
				{
					type: "row",
					fields: [
						{
							name: "country",
							type: "text",
							label: "Pays",
						},
						{
							name: "city",
							type: "text",
							label: "Ville",
						},
						{
							name: "postalCode",
							type: "text",
							label: "Code postal",
						},
					],
				},
				{
					name: "address",
					type: "text",
					label: "Adresse",
				},
				{
					type: "row",
					fields: [
						{
							name: "departmentCode",
							type: "text",
							label: "Code département",
						},
						{
							name: "department",
							type: "text",
							label: "Département",
						},
						{
							name: "region",
							type: "text",
							label: "Région",
						},
					],
				},
				{
					type: "row",
					fields: [
						{
							name: "cityStratum",
							type: "select",
							label: "Strate de la ville",
							options: [...CITY_STRATUM_OPTIONS],
						},
						{
							name: "nbPopulations",
							type: "number",
							label: "Nombre d'habitants",
						},
					],
				},
			],
		},
		{
			name: "relatedPictures",
			type: "join",
			label: "Photos associées",
			collection: "pictures",
			on: "report",
			orderable: true,
			defaultLimit: 0,
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
			name: "wordpressPostId",
			type: "number",
			label: "Code WordPress",
			admin: {
				position: "sidebar",
				readOnly: true,
			},
		},
		{
			name: "projectDetails",
			type: "group",
			label: "Détails du projet",
			fields: [
				{
					type: "row",
					fields: [
						{
							name: "projectOwner",
							type: "text",
							label: "Maître d'ouvrage",
						},
						{
							name: "projectManagement",
							type: "text",
							label: "Maître d'oeuvre",
						},
					],
				},
				{
					type: "row",
					fields: [
						{
							name: "deliveryYear",
							type: "number",
							label: "Année de livraison",
						},
						{
							name: "projectCost",
							type: "text",
							label: "Coût",
						},
						{
							name: "projectArea",
							type: "text",
							label: "Superficie",
						},
					],
				},
				{
					name: "photoAuthor",
					type: "text",
					label: "Auteur des photographies",
				},
			],
		},
	],
};
