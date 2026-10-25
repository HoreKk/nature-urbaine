import type { CollectionConfig, FieldAccess } from 'payload';
import { loggedIn } from '../access';
import { adminGroups } from '../admin/groups';
import { contributionReviewEndpoints } from '../endpoints/contribution-review';
import {
	locationDetailsField,
	projectDetailsField,
} from '../fields/report-fields';

/** What the Contributeur sent stays correctable until Valider or Refuser (ADR-0005). */
const editableWhilePending: FieldAccess = ({ doc }) =>
	doc?.status === 'pending';

export const Contributions: CollectionConfig = {
	slug: 'contributions',
	labels: {
		singular: 'Contribution',
		plural: 'Contributions',
	},
	defaultSort: '-createdAt',
	admin: {
		group: adminGroups.contributions,
		useAsTitle: 'title',
		defaultColumns: ['title', 'category', 'authorName', 'status', 'createdAt'],
		listSearchableFields: ['title', 'authorEmail'],
		components: {
			edit: {
				beforeDocumentControls: [
					'/payload/admin/ContributionReview#ContributionReview',
				],
			},
		},
	},
	endpoints: contributionReviewEndpoints,
	// Created only by `submitContribution`, server-side.
	access: {
		create: () => false,
		read: loggedIn,
		update: loggedIn,
		delete: loggedIn,
	},
	hooks: {
		afterDelete: [
			async ({ doc, req }) => {
				const archive =
					typeof doc.archive === 'object' ? doc.archive?.id : doc.archive;
				if (archive == null) return;
				await req.payload.delete({
					collection: 'contribution-archives',
					id: archive,
					overrideAccess: true,
					req,
				});
			},
		],
	},
	fields: [
		{
			name: 'title',
			type: 'text',
			label: 'Titre du projet',
			required: true,
			access: { update: editableWhilePending },
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			access: { update: editableWhilePending },
		},
		{
			name: 'category',
			type: 'relationship',
			relationTo: 'categories',
			label: 'Catégorie',
			required: true,
			access: { update: editableWhilePending },
		},
		{
			...projectDetailsField(),
			access: { update: editableWhilePending },
		},
		{
			...locationDetailsField(),
			access: { update: editableWhilePending },
		},
		{
			name: 'photosTakenAt',
			type: 'date',
			label: 'Date des photographies',
			admin: {
				description:
					'Lue dans les photos envoyées ; à défaut, la date d’envoi est utilisée pour le reportage.',
			},
			access: { update: editableWhilePending },
		},
		{
			type: 'row',
			fields: [
				{
					name: 'authorName',
					type: 'text',
					label: 'Auteur des photographies',
					required: true,
					access: { update: editableWhilePending },
				},
				{
					name: 'authorEmail',
					type: 'email',
					label: 'Email de l’auteur',
					required: true,
					access: { update: editableWhilePending },
				},
			],
		},
		{
			name: 'archive',
			type: 'upload',
			relationTo: 'contribution-archives',
			label: 'Photos (zip)',
			// Set by `submitContribution`; emptied by Refuser, which deletes the zip.
			admin: { readOnly: true },
		},
		{
			name: 'status',
			type: 'select',
			label: 'Statut',
			required: true,
			defaultValue: 'pending',
			options: [
				{ label: 'À traiter', value: 'pending' },
				{ label: 'Validée', value: 'accepted' },
				{ label: 'Publiée', value: 'published' },
				{ label: 'Refusée', value: 'rejected' },
			],
			admin: { position: 'sidebar', readOnly: true },
		},
		{
			name: 'rejectionNote',
			type: 'textarea',
			label: 'Motif de refus',
			admin: {
				position: 'sidebar',
				readOnly: true,
				condition: (data) => data.status === 'rejected',
			},
		},
		{
			name: 'report',
			type: 'relationship',
			relationTo: 'reports',
			label: 'Reportage',
			admin: {
				position: 'sidebar',
				readOnly: true,
				condition: (data) => Boolean(data.report),
			},
		},
		{
			name: 'consentedAt',
			type: 'date',
			label: 'Consentement de l’auteur',
			required: true,
			admin: {
				position: 'sidebar',
				readOnly: true,
				date: { pickerAppearance: 'dayAndTime' },
				description:
					'L’auteur a certifié être l’auteur des photos et autorisé leur publication avec son nom.',
			},
		},
	],
	versions: false,
	authorship: false,
};
