import type { CollectionConfig } from 'payload';
import { adminGroups } from '../admin-groups';

export const Media: CollectionConfig = {
	slug: 'media',
	labels: {
		singular: 'Image',
		plural: 'Images',
	},
	access: {
		read: () => true,
	},
	admin: {
		group: adminGroups.media,
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
