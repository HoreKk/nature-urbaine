import type { PostgresAdapter } from '@payloadcms/db-postgres';
import { eq } from '@payloadcms/db-postgres/drizzle';
import type { PayloadRequest } from 'payload';
import { contributions } from '../payload-generated-schema';

// Payload 4 beta has no after-commit hook: both helpers reach the Postgres
// adapter's open session, the one `req` writes through.
async function openSession(req: PayloadRequest) {
	const id = await req.transactionID;
	return id == null
		? undefined
		: (req.payload.db as unknown as PostgresAdapter).sessions[id];
}

/** Runs `effect` once `req`'s transaction commits, never when it rolls back. */
export async function afterCommit(
	req: PayloadRequest,
	effect: () => Promise<void>,
): Promise<void> {
	const session = await openSession(req);
	if (!session) {
		await effect();
		return;
	}
	const commit = session.resolve;
	session.resolve = async () => {
		await commit();
		void effect();
	};
}

/** Holds the row until the transaction ends, so two reviews can't both see `pending`. */
export async function lockContribution(req: PayloadRequest, id: number) {
	const session = await openSession(req);
	if (!session) throw new Error('lockContribution needs a transaction');
	await session.db
		.select({ id: contributions.id })
		.from(contributions)
		.where(eq(contributions.id, id))
		.for('update');
}
