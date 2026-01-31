import type { CollectionConfig } from "payload";

export const Pictures: CollectionConfig = {
	slug: "pictures",
	labels: {
		singular: "Photo",
		plural: "Photos",
	},
	access: {
		read: () => true,
	},
	upload: {
		mimeTypes: ["image/*"],
		adminThumbnail: "thumbnail",
		displayPreview: true,
		imageSizes: [
			{
				name: "thumbnail",
				width: 400,
				height: 300,
				position: "centre",
			},
		],
	},
	fields: [
		{
			name: "alt",
			type: "text",
			required: true,
		},
		{
			name: "report",
			type: "relationship",
			relationTo: "reports",
			label: "Rapport associé",
			required: true,
		},
		{
			name: "relatedTags",
			type: "relationship",
			relationTo: "tags",
			label: "Étiquettes associées",
			admin: {
				position: "sidebar",
			},
			hasMany: true,
		},
	],
};
