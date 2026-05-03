import { afterEach, describe, expect, it } from 'vitest';
import { readContactEmailConfig } from './contact-env';

const ORIGINAL_ENV = process.env;

describe('readContactEmailConfig', () => {
	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	it('parses no-auth maildev config', () => {
		process.env.CONTACT_EMAIL_TO = 'contact@example.com';
		process.env.CONTACT_EMAIL_FROM = 'noreply@example.com';

		const config = readContactEmailConfig();

		expect(config.to).toEqual(['contact@example.com']);
		expect(config.from).toBe('noreply@example.com');
	});

	it('throws when required values are missing', () => {
		delete process.env.CONTACT_EMAIL_TO;
		delete process.env.CONTACT_EMAIL_FROM;

		expect(() => readContactEmailConfig()).toThrowError('EMAIL_CONFIG_INVALID');
	});
});
