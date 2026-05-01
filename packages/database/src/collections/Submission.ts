import type { CollectionConfig } from "payload";

export const Submissions: CollectionConfig = {
	slug: "submissions",
	labels: {
		singular: "Contribution",
		plural: "Contributions",
	},
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "category", "status", "createdAt"],
		listSearchableFields: ["name", "contributorEmail"],
		defaultSort: "-createdAt",
	},
	access: {
		create: () => true,
		read: ({ req }) => !!req.user,
		update: ({ req }) => !!req.user,
		delete: ({ req }) => !!req.user,
	},
	fields: [
		{
			name: "name",
			type: "text",
			label: "Titre du projet",
			required: true,
		},
		{
			name: "description",
			type: "textarea",
			label: "Description",
			required: true,
		},
		{
			name: "category",
			type: "relationship",
			relationTo: "categories",
			label: "Catégorie",
			required: true,
		},
		{
			name: "deliveryYear",
			type: "number",
			label: "Année de livraison",
			required: true,
		},
		{
			name: "address",
			type: "text",
			label: "Adresse",
			required: true,
		},
		{
			name: "locationDetails",
			type: "group",
			label: "Localisation (BAN)",
			admin: {
				description: "Auto-dérivé de l'autocomplétion BAN lors de la soumission",
			},
			fields: [
				{
					name: "city",
					type: "text",
					label: "Commune",
				},
				{
					name: "postcode",
					type: "text",
					label: "Code postal",
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
				{
					name: "citycode",
					type: "text",
					label: "Code INSEE",
				},
			],
		},
		{
			name: "contributorEmail",
			type: "email",
			label: "Email du contributeur",
			required: true,
		},
		{
			name: "status",
			type: "select",
			label: "Statut",
			required: true,
			defaultValue: "pending",
			options: [
				{ label: "En attente", value: "pending" },
				{ label: "Acceptée", value: "accepted" },
				{ label: "Refusée", value: "rejected" },
			],
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "rejectionNote",
			type: "text",
			label: "Motif de refus",
			admin: {
				position: "sidebar",
				condition: (data) => data.status === "rejected",
			},
		},
		{
			name: "promoted",
			type: "checkbox",
			label: "Promu en reportage",
			defaultValue: false,
			admin: {
				position: "sidebar",
				readOnly: true,
			},
		},
		{
			name: "promotedReport",
			type: "relationship",
			relationTo: "reports",
			label: "Reportage dérivé",
			admin: {
				position: "sidebar",
				readOnly: true,
			},
		},
	],
};
