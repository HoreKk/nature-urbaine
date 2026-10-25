import type { Payload } from 'payload';

// The email module loads the Payload config, which loads the callers: import it late.
export async function emailContributor(
	req: { payload: Payload },
	send: (
		emails: typeof import('../../server/emails/contribution'),
	) => Promise<void>,
	failure: string,
): Promise<boolean> {
	try {
		await send(await import('../../server/emails/contribution'));
		return true;
	} catch (error) {
		req.payload.logger.error({ err: error }, failure);
		return false;
	}
}
