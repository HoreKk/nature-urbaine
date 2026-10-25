import type { Payload } from 'payload';
import { formatAdminURL } from 'payload/shared';

/** Relative for admin pages; pass `serverURL` for a link that leaves the admin, like an email. */
export const contributionAdminURL = (
	payload: Payload,
	id: number,
	serverURL?: string,
) =>
	formatAdminURL({
		adminRoute: payload.config.routes.admin,
		path: `/collections/contributions/${id}`,
		serverURL,
	});
