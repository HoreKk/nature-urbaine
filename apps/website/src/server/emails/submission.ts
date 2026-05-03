import { getPayload, payloadConfig } from '@nature-urbaine/database';
import { renderSubmissionEmail } from '@nature-urbaine/emails';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { readEmailConfig } from './email-env';

const createSubmissionNotificationSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis'),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(500, 'La description ne doit pas depasser 500 caracteres'),
	category: z.string().min(1, 'La categorie est requise'),
	deliveryYear: z.coerce.number().int().min(1900).max(2100),
	address: z.string().min(1, "L'adresse est requise"),
	contributorEmail: z.string().email('Adresse email invalide'),
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

export const sendSubmissionNotification = createServerFn({ method: 'POST' })
	.inputValidator(createSubmissionNotificationSchema)
	.handler(async ({ data }) => {
		try {
			const emailConfig = readEmailConfig();
			const payload = await getPayload({ config: payloadConfig });
			const rendered = await renderSubmissionEmail({
				name: data.name,
				description: data.description,
				category: data.category,
				deliveryYear: data.deliveryYear,
				address: data.address,
				contributorEmail: data.contributorEmail,
				submittedAtParis: getParisTimestamp(new Date()),
				source: '/contribuer',
			});

			await payload.sendEmail({
				from: emailConfig.from,
				to: emailConfig.to,
				replyTo: data.contributorEmail,
				subject: rendered.subject,
				html: rendered.html,
				text: rendered.text,
			});

			return { ok: true as const };
		} catch (error) {
			console.error('Submission email sending failed', {
				error,
			});
			throw new Error('SUBMISSION_EMAIL_SEND_FAILED', { cause: error });
		}
	});
