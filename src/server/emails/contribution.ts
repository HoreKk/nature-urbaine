import type { ContributionEmailInput } from '@/emails/templates/contribution/ContributionNotificationEmail';
import { renderContributionEmail } from '@/emails/templates/contribution/render-contribution-email';
import { getParisTimestamp, sendTemplatedEmail } from './send-email';

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
