import payloadConfig from '@payload-config';
import { getPayload } from 'payload';
import type { RenderedEmail } from '@/emails/render-email';
import { createRateLimiter } from '../rate-limit';
import { readEmailConfig } from './email-env';

// Resend's free plan stops at 100 emails a day: a form flood spread over many
// IPs must leave headroom for Payload's own emails (admin password resets).
const dailyEmails = createRateLimiter({
	limit: 50,
	windowMs: 24 * 60 * 60 * 1000,
});

export function getParisTimestamp(now: Date): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: 'Europe/Paris',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(now);
}

async function deliver(
	rendered: RenderedEmail,
	recipients: { to: string | string[]; replyTo: string | string[] },
): Promise<void> {
	if (!dailyEmails.consume('all')) {
		throw new Error('EMAIL_DAILY_CAP_REACHED');
	}

	const payload = await getPayload({ config: payloadConfig });

	await payload.sendEmail({
		...recipients,
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
	});
}

/** To the operator; replies go to the visitor who filled the form. */
export async function sendOperatorEmail(
	rendered: RenderedEmail,
	replyTo: string,
): Promise<void> {
	await deliver(rendered, { to: readEmailConfig().to, replyTo });
}

/** To a Contributeur; replies go to the operator. */
export async function sendContributorEmail(
	rendered: RenderedEmail,
	to: string,
): Promise<void> {
	await deliver(rendered, { to, replyTo: readEmailConfig().to });
}
