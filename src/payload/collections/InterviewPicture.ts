import { pictureCollection } from '../utilities/picture-collection';

// No tags: tag search only covers Report photos (see `tags.ts`).
export const InterviewPictures = pictureCollection({
	slug: 'interview-pictures',
	labels: {
		singular: "Photo d'interview",
		plural: "Photos d'interview",
	},
	owner: {
		field: 'interview',
		collection: 'interviews',
		label: 'Interview associée',
	},
});
