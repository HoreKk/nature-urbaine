import { getPayload, payloadConfig } from '@nature-urbaine/database';
import { renderContactEmail } from '@nature-urbaine/emails';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { readContactEmailConfig } from './contact-env';

const createContactSchema = z.object({
	firstName: z.string().min(1, 'Le prenom est requis'),
	lastName: z.string().min(1, 'Le nom est requis'),
	email: z.string().email('Adresse email invalide'),
	sector: z.string().min(1, "Le secteur d'activite est requis"),
	message: z.string().min(1, 'Le message est requis'),
});

function getParisTimestamp(now: Date): string {
	return new Intl.DateTimeFormat('fr-FR', {
		timeZone: 'Europe/Paris',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(now);
}

export const createContact = createServerFn({ method: 'POST' })
	.inputValidator(createContactSchema)
	.handler(async ({ data }) => {
		try {
			const emailConfig = readContactEmailConfig();
			const payload = await getPayload({ config: payloadConfig });
			const rendered = await renderContactEmail({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				sector: data.sector,
				message: data.message,
				submittedAtParis: getParisTimestamp(new Date()),
				source: '/contact',
			});

			await payload.sendEmail({
				from: emailConfig.from,
				to: emailConfig.to,
				replyTo: data.email,
				subject: rendered.subject,
				html: rendered.html,
				text: rendered.text,
			});

			return { ok: true as const };
		} catch (error) {
			console.error('Contact email sending failed', {
				error,
			});
			throw new Error('CONTACT_EMAIL_SEND_FAILED', { cause: error });
		}
	});
