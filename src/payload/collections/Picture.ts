import { readPublishedReportPictures } from '../access';
import { pictureCollection } from '../utilities/picture-collection';

// The slug predates Interview photos; renaming it would move ~19k rows and objects.
export const Pictures = pictureCollection({
	slug: 'pictures',
	labels: {
		singular: 'Photo de reportage',
		plural: 'Photos de reportage',
	},
	owner: {
		field: 'report',
		collection: 'reports',
		label: 'Reportage associé',
	},
	read: readPublishedReportPictures,
	fields: [
		{
			name: 'relatedTags',
			type: 'relationship',
			relationTo: 'tags',
			label: 'Étiquettes associées',
			admin: {
				position: 'sidebar',
			},
			hasMany: true,
		},
	],
});
