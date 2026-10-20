import { getPayload } from '@nature-urbaine/database';
import config from '@payload-config';
import { createMiddleware } from '@tanstack/react-start';

export const baseProcedure = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const db = await getPayload({ config });

		return next({
			context: { db },
		});
	},
);
