import config from '@payload-config';
import { createMiddleware } from '@tanstack/react-start';
import { getPayload } from 'payload';

/**
 * `drizzle` is typed by `src/payload/payload-generated-schema.ts`: reserve it
 * for reads the local API can't do cheaply, like whole-catalog aggregates.
 */
export const baseProcedure = createMiddleware({ type: 'function' }).server(
	async ({ next }) => {
		const db = await getPayload({ config });

		return next({
			context: { db, drizzle: db.db.drizzle },
		});
	},
);
