import type { Field } from "payload";

export const seedKeyField: Field = {
	name: "seedKey",
	type: "text",
	label: "Clé de seed",
	unique: true,
	index: true,
	admin: {
		position: "sidebar",
		readOnly: true,
		condition: (data) => Boolean(data?.seedKey),
		description:
			"Identifiant stable utilisé par les scripts de seed pour mettre à jour cet enregistrement. Ne pas modifier.",
	},
};
