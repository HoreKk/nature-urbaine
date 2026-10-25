const sectors = (labels: string[]) => labels.map((label) => ({ label }));

/** Client's list (2026-10-24); Payload also serves it until the global is first saved. */
export const DEFAULT_CONTACT_SECTOR_GROUPS = [
	{
		label: "Maîtrise d'ouvrage",
		sectors: sectors([
			'Ville',
			'Intercommunalité, EPT',
			'SEM, SPL',
			'Département',
			'Région',
			'État',
			'Entreprise',
			'Promoteur',
			'Bailleur social',
		]),
	},
	{
		label: "Maîtrise d'œuvre",
		sectors: sectors([
			'Paysagiste concepteur',
			'Architecte',
			'Urbaniste',
			"Bureau d'études VRD",
			'Environnement',
			'Hydraulicien',
			'Éclairagiste, concepteur lumière',
			'Économiste de la construction',
			'Écologue',
			'OPC, topographe',
			'Géomètre',
			'Concertation',
		]),
	},
	{ label: null, sectors: sectors(['Autre']) },
];
