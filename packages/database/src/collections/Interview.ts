import type { CollectionConfig } from "payload";
import { seedKeyField } from "../utils/seed-key-field";

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
		seedKeyField,
		{
			name: "thumbnail",
			type: "upload",
			label: "Vignette",
			relationTo: "media",
		},
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
			name: "intervieweePicture",
			type: "upload",
			label: "Photo de la personne interviewée",
			relationTo: "media",
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
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "projectOwner",
					type: "text",
					label: "Maîtrise d'ouvrage",
					required: true,
				},
				{
					name: "projectManagement",
					type: "text",
					label: "Maîtrise d'œuvre",
					required: true,
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "projectCost",
					type: "text",
					label: "Coût",
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
			label: "Date de l'interview",
			required: true,
			admin: {
				position: "sidebar",
			},
		},
	],
};
