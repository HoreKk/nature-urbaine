import { createServerFn } from '@tanstack/react-start';
import { baseProcedure } from './db';

export const getContactSectorGroups = createServerFn({ method: 'GET' })
	.middleware([baseProcedure])
	.handler(async ({ context }) => {
		const forms = await context.db.findGlobal({ slug: 'forms', depth: 0 });

		return forms.contact.sectorGroups;
	});
