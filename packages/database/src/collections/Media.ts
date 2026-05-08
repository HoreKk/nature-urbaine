import type { CollectionConfig } from "payload";
import { seedKeyField } from "../utils/seed-key-field";

export const Media: CollectionConfig = {
	slug: "media",
	labels: {
		singular: "Média",
		plural: "Médias",
	},
	access: {
		read: () => true,
	},
	fields: [
		seedKeyField,
		{
			name: "alt",
			type: "text",
			required: true,
		},
	],
	upload: true,
};
