import type { CollectionConfig } from "payload";

export const Interviews: CollectionConfig = {
	slug: "interviews",
	labels: {
		singular: "Interview",
		plural: "Interviews",
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
			type: "row",
			fields: [
				{
					name: "interviewee",
					type: "text",
					label: "Personne interviewée",
					required: true,
				},
				{
					name: "intervieweeRole",
					type: "text",
					label: "Rôle de la personne interviewée",
					required: true,
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "city",
					type: "text",
					label: "Ville",
					required: true,
				},
				{
					name: "department",
					type: "text",
					label: "Département",
					required: true,
				},
				{
					name: "area",
					type: "text",
					label: "Superficie",
					required: true,
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "projectOwner",
					type: "text",
					label: "Maitrise d'oeuvre",
					required: true,
				},
				{
					name: "projectManagement",
					type: "text",
					label: "Maitrise d'ouvrage",
					required: true,
				},
			],
		},
		{
			name: "summary",
			type: "textarea",
			label: "Résumé",
			required: true,
		},
		{
			type: "group",
			name: "projectDetails",
			label: "Contenu",
			fields: [
				{
					name: "objectives",
					type: "richText",
					label:
						"Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?",
					required: true,
				},
				{
					name: "impacts",
					type: "richText",
					label:
						"Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ? ",
					required: true,
				},
				{
					name: "challenges",
					type: "richText",
					label:
						"Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?",
					required: true,
				},
			],
		},
		{
			name: "realisedAt",
			type: "date",
			label: "Date de réalisation",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "publishedAt",
			type: "date",
			label: "Date de publication",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
	],
};
