import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
	slug: 'users',
	labels: {
		singular: 'Administrateur',
		plural: 'Administrateurs',
	},
	admin: {
		useAsTitle: 'email',
	},
	auth: {
		// The admin shares the public HTTPS domain: never send the session over
		// plain HTTP in production. Local dev stays on http://localhost.
		cookies: { secure: process.env.NODE_ENV === 'production' },
	},
	fields: [],
	versions: false,
	authorship: false,
};
