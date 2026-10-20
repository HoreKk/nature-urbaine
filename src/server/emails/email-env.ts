import { z } from 'zod';

const emailConfigSchema = z.object({
	to: z.array(z.string().email()).min(1),
	from: z.string().email(),
});

export function readEmailConfig() {
	const recipients = (
		process.env.TO_EMAIL ??
		process.env.CONTACT_EMAIL_TO ??
		''
	)
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);

	const parsed = emailConfigSchema.safeParse({
		to: recipients,
		from: process.env.EMAIL_FROM ?? process.env.CONTACT_EMAIL_FROM,
	});

	if (!parsed.success) {
		throw new Error('EMAIL_CONFIG_INVALID');
	}

	return parsed.data;
}
