import type { CollectionConfig } from 'payload';
import { adminGroups } from '../admin-groups';

const HEX_COLOR = /^#[0-9A-F]{6}$/i;

export const Categories: CollectionConfig = {
	slug: 'categories',
	// Public catalog data: the website reads it without a user (Payload 4
	// enforces access on the Local API by default).
	access: {
		read: () => true,
	},
	labels: {
		singular: 'Catégorie',
		plural: 'Catégories',
	},
	admin: {
		group: adminGroups.taxonomy,
		useAsTitle: 'name',
		defaultColumns: ['name', 'color'],
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			label: 'Nom',
			required: true,
		},
		{
			name: 'color',
			type: 'text',
			label: 'Couleur',
			required: true,
			// Neutral gray (paper.500): rows created before the field existed get it.
			defaultValue: '#6B6E66',
			validate: (value: string | null | undefined) =>
				(value && HEX_COLOR.test(value)) ||
				'Couleur hexadécimale attendue, par exemple #238EA9.',
			admin: {
				description:
					'Pastille de la catégorie sur le site. Choisir une teinte distincte des autres catégories et du bleu de la marque.',
				components: {
					Field: '/payload/admin/ColorPickerField#ColorPickerField',
				},
			},
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
		},
		{
			name: 'relatedReports',
			type: 'join',
			collection: 'reports',
			on: 'category',
			label: 'Rapports associés',
		},
	],
	versions: false,
	authorship: false,
};
