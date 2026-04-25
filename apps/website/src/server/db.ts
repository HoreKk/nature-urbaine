import { getPayload, payloadConfig } from '@nature-urbaine/database';
import { createMiddleware } from '@tanstack/react-start';

export const baseProcedure = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const db = await getPayload({ config: payloadConfig });

		return next({
			context: { db },
		});
	},
);
