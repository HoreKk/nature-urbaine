import { z } from 'zod';

const emailConfigSchema = z.object({
	to: z.array(z.string().email()).min(1),
});

// The sender (EMAIL_FROM, EMAIL_FROM_NAME) lives on the Payload email adapter.
export function readEmailConfig() {
	const recipients = (process.env.TO_EMAIL ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

	const parsed = emailConfigSchema.safeParse({ to: recipients });

	if (!parsed.success) {
		throw new Error('EMAIL_CONFIG_INVALID');
	}

	return parsed.data;
}
