import type { ContributionNotificationEmailInput } from '@/emails/templates/contribution/ContributionNotificationEmail';
import {
	renderContributionNotificationEmail,
	renderContributionPublishedEmail,
	renderContributionRejectedEmail,
} from '@/emails/templates/contribution/render-contribution-email';
import type { Contribution } from '@/payload/payload-types';
import { siteOrigin } from '../site-origin';
import {
	getParisTimestamp,
	sendContributorEmail,
	sendOperatorEmail,
} from './send-email';

type Contributor = Pick<Contribution, 'title' | 'authorName' | 'authorEmail'>;

export async function sendContributionNotificationEmail(
	data: Omit<ContributionNotificationEmailInput, 'submittedAtParis' | 'source'>,
): Promise<void> {
	const rendered = await renderContributionNotificationEmail({
		...data,
		submittedAtParis: getParisTimestamp(new Date()),
		source: '/contribuer',
	});

	await sendOperatorEmail(rendered, data.authorEmail);
}

export async function sendContributionRejectedEmail(
	{ title, authorName, authorEmail }: Contributor,
	rejectionNote: string,
): Promise<void> {
	await sendContributorEmail(
		await renderContributionRejectedEmail({
			title,
			authorName,
			rejectionNote,
		}),
		authorEmail,
	);
}

export async function sendContributionPublishedEmail(
	{ title, authorName, authorEmail }: Contributor,
	reportId: number,
): Promise<void> {
	await sendContributorEmail(
		await renderContributionPublishedEmail({
			title,
			authorName,
			reportUrl: `${siteOrigin()}/reports/${reportId}`,
		}),
		authorEmail,
	);
}
