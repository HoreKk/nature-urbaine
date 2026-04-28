import type { CollectionConfig } from "payload";
import { getSeasonFromDate } from "../utils/hooks";

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
					name: "location",
					type: "point",
					label: "Point cartographique",
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
							type: "text",
							label: "Strate de la ville",
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
			name: "projectDetails",
			type: "group",
			label: "Détails du projet",
			fields: [
				{
					type: "row",
					fields: [
						{
							name: "photoAuthor",
							type: "text",
							label: "Auteur",
						},
						{
							name: "wordpressPostId",
							type: "number",
							label: "Code WordPress",
						},
					],
				},
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
			],
		},
	],
};
