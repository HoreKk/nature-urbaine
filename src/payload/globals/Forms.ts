import type { GlobalConfig } from 'payload';
import { adminGroups } from '../admin/groups';
import { DEFAULT_CONTACT_SECTOR_GROUPS } from '../fields/contact-sectors';

export const Forms: GlobalConfig = {
	slug: 'forms',
	label: 'Formulaires',
	admin: {
		group: adminGroups.settings,
	},
	// The website reads it without a user (Payload 4 enforces access on the Local API).
	access: {
		read: () => true,
	},
	fields: [
		{
			type: 'tabs',
			tabs: [
				{
					name: 'contact',
					label: 'Contact',
					fields: [
						{
							name: 'sectorGroups',
							type: 'array',
							label: "Secteurs d'activité",
							labels: { singular: 'Groupe', plural: 'Groupes' },
							required: true,
							minRows: 1,
							defaultValue: DEFAULT_CONTACT_SECTOR_GROUPS,
							admin: {
								description:
									'Choix du menu déroulant « Secteur d’activité », regroupés sous un titre.',
							},
							fields: [
								{
									name: 'label',
									type: 'text',
									label: 'Titre du groupe',
									admin: {
										description:
											'Laisser vide pour afficher les choix sans titre (ex. « Autre »).',
									},
								},
								{
									name: 'sectors',
									type: 'array',
									label: 'Choix',
									labels: { singular: 'Choix', plural: 'Choix' },
									required: true,
									minRows: 1,
									fields: [
										{
											name: 'label',
											type: 'text',
											label: 'Libellé',
											required: true,
										},
									],
								},
							],
						},
					],
				},
			],
		},
	],
	versions: false,
	authorship: false,
};
