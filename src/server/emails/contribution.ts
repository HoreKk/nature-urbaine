import { getRequestUrl } from '@tanstack/react-start/server';
import type { ContributionEmailInput } from '@/emails/templates/contribution/ContributionNotificationEmail';
import type { ContributionPublishedEmailInput } from '@/emails/templates/contribution/ContributionPublishedEmail';
import type { ContributionRejectedEmailInput } from '@/emails/templates/contribution/ContributionRejectedEmail';
import {
	renderContributionEmail,
	renderContributionPublishedEmail,
	renderContributionRejectedEmail,
} from '@/emails/templates/contribution/render-contribution-email';
import {
	getParisTimestamp,
	sendContributorEmail,
	sendTemplatedEmail,
} from './send-email';

export async function sendContributionEmail(
	data: Omit<ContributionEmailInput, 'submittedAtParis' | 'source'>,
): Promise<void> {
	const rendered = await renderContributionEmail({
		...data,
		submittedAtParis: getParisTimestamp(new Date()),
		source: '/contribuer',
	});

	await sendTemplatedEmail(rendered, data.authorEmail);
}

export async function sendContributionRejectedEmail(
	data: ContributionRejectedEmailInput & { authorEmail: string },
): Promise<void> {
	await sendContributorEmail(
		await renderContributionRejectedEmail(data),
		data.authorEmail,
	);
}

export async function sendContributionPublishedEmail({
	reportId,
	...data
}: Omit<ContributionPublishedEmailInput, 'reportUrl'> & {
	authorEmail: string;
	reportId: number;
}): Promise<void> {
	const origin = getRequestUrl({
		xForwardedHost: true,
		xForwardedProto: true,
	}).origin;
	await sendContributorEmail(
		await renderContributionPublishedEmail({
			...data,
			reportUrl: `${origin}/reports/${reportId}`,
		}),
		data.authorEmail,
	);
}
