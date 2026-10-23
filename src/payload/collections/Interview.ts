import type { CollectionConfig } from 'payload';
import { DEFAULT_INTERVIEW_QUESTIONS } from './interview-questions';

export const Interviews: CollectionConfig = {
	slug: 'interviews',
	// Public catalog data: the website reads it without a user (Payload 4
	// enforces access on the Local API by default).
	access: {
		read: () => true,
	},
	labels: {
		singular: 'Interview',
		plural: 'Interviews',
	},
	admin: {
		useAsTitle: 'name',
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			label: 'Nom',
			required: true,
		},
		{
			type: 'row',
			fields: [
				{
					name: 'interviewee',
					type: 'text',
					label: 'Personne interviewée',
					required: true,
				},
				{
					name: 'intervieweeRole',
					type: 'text',
					label: 'Rôle de la personne interviewée',
					required: true,
				},
			],
		},
		{
			name: 'intervieweePicture',
			type: 'upload',
			label: 'Photo de la personne interviewée',
			relationTo: 'media',
		},
		{
			type: 'row',
			fields: [
				{
					name: 'city',
					type: 'text',
					label: 'Ville',
					required: true,
				},
				{
					name: 'department',
					type: 'text',
					label: 'Département',
					required: true,
				},
			],
		},
		{
			type: 'row',
			fields: [
				{
					name: 'projectOwner',
					type: 'text',
					label: "Maîtrise d'ouvrage",
					required: true,
				},
				{
					name: 'projectManagement',
					type: 'text',
					label: "Maîtrise d'œuvre",
					required: true,
				},
			],
		},
		{
			type: 'row',
			fields: [
				{
					name: 'projectCost',
					type: 'text',
					label: 'Coût',
				},
				{
					name: 'area',
					type: 'text',
					label: 'Superficie',
					required: true,
				},
			],
		},
		{
			name: 'relatedPictures',
			type: 'join',
			label: 'Photos associées',
			collection: 'interview-pictures',
			on: 'interview',
			orderable: true,
			defaultLimit: 0,
			admin: {
				defaultColumns: ['filename'],
			},
			hasMany: true,
		},
		{
			name: 'summary',
			type: 'textarea',
			label: 'Résumé',
			required: true,
		},
		{
			name: 'questions',
			type: 'array',
			label: 'Questions / réponses',
			labels: { singular: 'Question', plural: 'Questions' },
			minRows: 1,
			required: true,
			defaultValue: DEFAULT_INTERVIEW_QUESTIONS.map((question) => ({
				question,
			})),
			admin: {
				components: {
					RowLabel:
						'/payload/admin/InterviewQuestionRowLabel#InterviewQuestionRowLabel',
				},
			},
			fields: [
				{
					name: 'question',
					type: 'text',
					label: 'Question',
					required: true,
				},
				{
					name: 'answer',
					type: 'richText',
					label: 'Réponse',
					required: true,
				},
			],
		},
		{
			name: 'realisedAt',
			type: 'date',
			label: 'Date de réalisation',
			required: true,
			admin: {
				position: 'sidebar',
			},
		},
		{
			name: 'publishedAt',
			type: 'date',
			label: "Date de l'interview",
			required: true,
			admin: {
				position: 'sidebar',
			},
		},
	],
	versions: false,
	authorship: false,
};
