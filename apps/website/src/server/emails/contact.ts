import { renderContactEmail } from '@nature-urbaine/emails';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getParisTimestamp, sendTemplatedEmail } from './send-email';

const createContactSchema = z.object({
	firstName: z.string().min(1, 'Le prenom est requis'),
	lastName: z.string().min(1, 'Le nom est requis'),
	email: z.string().email('Adresse email invalide'),
	sector: z.string().min(1, "Le secteur d'activite est requis"),
	message: z.string().min(1, 'Le message est requis'),
});

export const createContact = createServerFn({ method: 'POST' })
	.inputValidator(createContactSchema)
	.handler(async ({ data }) => {
		try {
			const rendered = await renderContactEmail({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				sector: data.sector,
				message: data.message,
				submittedAtParis: getParisTimestamp(new Date()),
				source: '/contact',
			});

			await sendTemplatedEmail(rendered, data.email);

			return { ok: true as const };
		} catch (error) {
			console.error('Contact email sending failed', { error });
			throw new Error('CONTACT_EMAIL_SEND_FAILED', { cause: error });
		}
	});
