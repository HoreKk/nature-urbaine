import type { CollectionConfig } from 'payload';
import { loggedIn } from '../access';
import { adminGroups } from '../admin/groups';

/** The zip of a Contribution's photos: only the operator downloads it (ADR-0005). */
export const ContributionArchives: CollectionConfig = {
	slug: 'contribution-archives',
	labels: {
		singular: 'Archive de contribution',
		plural: 'Archives de contributions',
	},
	admin: {
		group: adminGroups.contributions,
		useAsTitle: 'filename',
		defaultColumns: ['filename', 'filesize', 'createdAt'],
	},
	// Created only by `submitContribution`, server-side.
	access: {
		create: () => false,
		read: loggedIn,
		update: () => false,
		delete: loggedIn,
	},
	upload: {
		mimeTypes: ['application/zip'],
	},
	fields: [],
	versions: false,
	authorship: false,
};
