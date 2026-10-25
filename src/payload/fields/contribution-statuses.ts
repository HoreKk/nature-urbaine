/** `label` names one Contribution's status; `queueLabel` heads its count on the dashboard. */
export const CONTRIBUTION_STATUSES = [
	{ value: 'pending', label: 'À traiter', queueLabel: 'À traiter' },
	{ value: 'accepted', label: 'Validée', queueLabel: 'Validées, à publier' },
	{ value: 'published', label: 'Publiée', queueLabel: 'Publiées' },
	{ value: 'rejected', label: 'Refusée', queueLabel: 'Refusées' },
] as const;
