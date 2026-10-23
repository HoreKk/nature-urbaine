import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
	slug: 'media',
	labels: {
		singular: 'Média',
		plural: 'Médias',
	},
	access: {
		read: () => true,
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			required: true,
		},
	],
	upload: {
		adminThumbnail: 'thumbnail',
		// Same variants as `pictures`, from `image-variants.ts`.
	},
	versions: false,
	authorship: false,
};
