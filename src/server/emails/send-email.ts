import { getPayload, payloadConfig } from '@nature-urbaine/database';
import { readEmailConfig } from './email-env';

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
	const emailConfig = readEmailConfig();
	const payload = await getPayload({ config: payloadConfig });

	await payload.sendEmail({
		from: emailConfig.from,
		to: emailConfig.to,
		replyTo,
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
	});
}
