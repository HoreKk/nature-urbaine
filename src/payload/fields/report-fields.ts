import type { Field, GroupField } from 'payload';

export const CITY_STRATUM_OPTIONS = [
	{ label: 'Moins de 500 hab.', value: 'moins-de-500' },
	{ label: 'De 500 à 2 000 hab.', value: '500-a-2000' },
	{ label: 'De 2 000 à 3 500 hab.', value: '2000-a-3500' },
	{ label: 'De 3 500 à 10 000 hab.', value: '3500-a-10000' },
	{ label: 'De 10 000 à 30 000 hab.', value: '10000-a-30000' },
	{ label: 'De 30 000 à 100 000 hab.', value: '30000-a-100000' },
	{ label: 'Plus de 100 000 hab.', value: 'plus-de-100000' },
] as const;

// Builders, not constants: Payload sanitizes field configs in place, so a
// Contribution and its Report must never share one object.

export const locationDetailsField = (): GroupField => ({
	name: 'locationDetails',
	type: 'group',
	label: 'Localisation',
	fields: [
		{
			type: 'row',
			fields: [
				{
					name: 'country',
					type: 'text',
					label: 'Pays',
				},
				{
					name: 'city',
					type: 'text',
					label: 'Ville',
				},
				{
					name: 'postalCode',
					type: 'text',
					label: 'Code postal',
				},
			],
		},
		{
			name: 'address',
			type: 'text',
			label: 'Adresse',
		},
		{
			type: 'row',
			fields: [
				{
					name: 'departmentCode',
					type: 'text',
					label: 'Code département',
				},
				{
					name: 'department',
					type: 'text',
					label: 'Département',
				},
				{
					name: 'region',
					type: 'text',
					label: 'Région',
				},
			],
		},
		{
			name: 'cityStratum',
			type: 'select',
			label: 'Strate de la ville',
			options: [...CITY_STRATUM_OPTIONS],
		},
	],
});

/** `projectDetails` group; a Report adds the photo credit after these fields. */
export const projectDetailsField = (extraFields: Field[] = []): GroupField => ({
	name: 'projectDetails',
	type: 'group',
	label: 'Détails du projet',
	fields: [
		{
			type: 'row',
			fields: [
				{
					name: 'projectOwner',
					type: 'text',
					label: "Maître d'ouvrage",
				},
				{
					name: 'projectManagement',
					type: 'text',
					label: "Maître d'oeuvre",
				},
			],
		},
		{
			type: 'row',
			fields: [
				{
					name: 'deliveryYear',
					type: 'number',
					label: 'Année de livraison',
				},
				{
					name: 'projectCost',
					type: 'text',
					label: 'Coût',
				},
				{
					name: 'projectArea',
					type: 'text',
					label: 'Superficie',
				},
			],
		},
		...extraFields,
	],
});
