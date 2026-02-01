import { createMiddleware } from '@tanstack/react-start';
import { getPayload, payloadConfig } from 'cms-payload';

export const baseProcedure = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const db = await getPayload({ config: payloadConfig });

		return next({
			context: { db },
		});
	},
);
