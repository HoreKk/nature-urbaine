import type { CollectionAfterChangeHook } from 'payload';
import type { Report } from '../payload-types';
import { emailContributor } from '../utilities/email-contributor';
import { afterCommit } from '../utilities/transaction';

/**
 * A Report's first publish moves its Contribution from `accepted` to
 * `published` and tells the Contributeur; later publishes find no `accepted` row.
 */
export const publishContributionHook: CollectionAfterChangeHook<
	Report
> = async ({ doc, previousDoc, req }) => {
	if (doc._status !== 'published' || previousDoc?._status === 'published') {
		return doc;
	}

	const {
		docs: [contribution],
	} = await req.payload.find({
		collection: 'contributions',
		where: {
			report: { equals: doc.id },
			status: { equals: 'accepted' },
		},
		limit: 1,
		depth: 0,
		req,
	});
	if (!contribution) return doc;

	await req.payload.update({
		collection: 'contributions',
		id: contribution.id,
		depth: 0,
		req,
		data: { status: 'published' },
	});

	// Publishing must not fail on an email; the operator can write by hand.
	await afterCommit(req, async () => {
		await emailContributor(
			req,
			(emails) => emails.sendContributionPublishedEmail(contribution, doc.id),
			'Contribution published email failed',
		);
	});
	return doc;
};
