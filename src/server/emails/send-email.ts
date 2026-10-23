import payloadConfig from '@payload-config';
import { getPayload } from 'payload';
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

interface RenderedEmail {
	subject: string;
	html: string;
	text: string;
}

export async function sendTemplatedEmail(
	rendered: RenderedEmail,
	replyTo: string,
): Promise<void> {
	if (!dailyEmails.consume('all')) {
		throw new Error('EMAIL_DAILY_CAP_REACHED');
	}

	const emailConfig = readEmailConfig();
	const payload = await getPayload({ config: payloadConfig });

	await payload.sendEmail({
		to: emailConfig.to,
		replyTo,
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
	});
}
