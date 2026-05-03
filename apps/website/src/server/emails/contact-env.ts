import { z } from 'zod';

const contactEmailConfigSchema = z.object({
	to: z.array(z.string().email()).min(1),
	from: z.string().email(),
});

export function readContactEmailConfig() {
	const recipients = (process.env.CONTACT_EMAIL_TO ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

	const parsed = contactEmailConfigSchema.safeParse({
		to: recipients,
		from: process.env.CONTACT_EMAIL_FROM,
	});

	if (!parsed.success) {
		throw new Error('EMAIL_CONFIG_INVALID');
	}

	return parsed.data;
}
