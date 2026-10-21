import config from '@payload-config';
import { createMiddleware } from '@tanstack/react-start';
import { getPayload } from 'payload';

export const baseProcedure = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const db = await getPayload({ config });

		return next({
			context: { db },
		});
	},
);
