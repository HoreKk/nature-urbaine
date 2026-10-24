import type { CollectionConfig } from 'payload';
import { readPublishedReports } from '../access';
import { adminGroups } from '../admin-groups';
import { publishContributionHook } from '../contribution-review';
import { computeReportNameHook, getSeasonFromDate } from '../utils/hooks';
import { locationDetailsField, projectDetailsField } from './report-fields';

export const Reports: CollectionConfig = {
	slug: 'reports',
	// The website reads without a user, so this rule is what keeps drafts off it.
	access: {
		read: readPublishedReports,
	},
	labels: {
		singular: 'Reportage',
		plural: 'Reportages',
	},
	// Drafts save incomplete, as Valider creates them (ADR-0005); publishing validates.
	versions: {
		drafts: {
			validate: false,
		},
	},
	admin: {
		group: adminGroups.content,
		useAsTitle: 'name',
	},
	hooks: {
		afterChange: [publishContributionHook],
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			label: 'Nom',
			required: true,
			admin: {
				readOnly: true,
				description:
					'Calculé à partir de la ville et du nom du projet (précédés du pays hors France).',
			},
			hooks: {
				beforeChange: [computeReportNameHook],
			},
		},
		{
			name: 'slug',
			type: 'text',
			label: 'Slug',
			virtual: true,
			admin: {
				readOnly: true,
			},
			hooks: {
				afterRead: [
					({ siblingData }) => {
						siblingData.slug = siblingData.name
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, '-')
							.replace(/(^-|-$)/g, '');
					},
				],
			},
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			required: true,
		},
		{
			name: 'projectName',
			type: 'text',
			label: 'Nom du projet',
		},
		locationDetailsField(),
		{
			name: 'relatedPictures',
			type: 'join',
			label: 'Photos associées',
			collection: 'pictures',
			on: 'report',
			orderable: true,
			defaultLimit: 0,
			admin: {
				defaultColumns: ['filename'],
			},
			hasMany: true,
		},
		{
			name: 'contribution',
			type: 'ui',
			admin: {
				position: 'sidebar',
				components: {
					Field: '/payload/admin/ReportContribution#ReportContribution',
				},
			},
		},
		{
			name: 'category',
			type: 'relationship',
			relationTo: 'categories',
			label: 'Catégorie',
			required: true,
			admin: {
				position: 'sidebar',
			},
		},
		{
			name: 'date',
			type: 'date',
			label: 'Date du rapport',
			required: true,
			admin: {
				position: 'sidebar',
			},
		},
		{
			name: 'season',
			type: 'select',
			label: 'Saison',
			options: [
				{ label: 'Printemps', value: 'spring' },
				{ label: 'Été', value: 'summer' },
				{ label: 'Automne', value: 'autumn' },
				{ label: 'Hiver', value: 'winter' },
			],
			admin: { readOnly: true, position: 'sidebar' },
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
			name: 'wordpressPostId',
			type: 'number',
			label: 'Code WordPress',
			admin: {
				position: 'sidebar',
				readOnly: true,
			},
		},
		projectDetailsField([
			{
				name: 'photoAuthor',
				type: 'text',
				label: 'Auteur des photographies',
			},
		]),
	],
	authorship: false,
};
