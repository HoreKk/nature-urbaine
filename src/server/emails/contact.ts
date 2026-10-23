import { createServerFn } from '@tanstack/react-start';
import { renderContactEmail } from '@/emails/templates/contact/render-contact-email';
import { wireContactSchema } from '../contact-contract';
import { guardFormSubmission } from '../form-guard';
import { getParisTimestamp, sendTemplatedEmail } from './send-email';

export const createContact = createServerFn({ method: 'POST' })
	.validator(wireContactSchema)
	.handler(async ({ data }) => {
		if (!guardFormSubmission('contact', data)) {
			return { ok: true as const };
		}

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
