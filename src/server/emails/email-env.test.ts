import { afterEach, describe, expect, it } from 'vitest';
import { readEmailConfig } from './email-env';

const ORIGINAL_ENV = process.env;

describe('readEmailConfig', () => {
	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	it('parses shared email config', () => {
		process.env.TO_EMAIL = 'ops@example.com';
		process.env.EMAIL_FROM = 'noreply@example.com';

		const config = readEmailConfig();

		expect(config.to).toEqual(['ops@example.com']);
		expect(config.from).toBe('noreply@example.com');
	});

	it('falls back to legacy contact-specific env vars', () => {
		delete process.env.TO_EMAIL;
		delete process.env.EMAIL_FROM;
		process.env.CONTACT_EMAIL_TO = 'contact@example.com';
		process.env.CONTACT_EMAIL_FROM = 'noreply@example.com';

		const config = readEmailConfig();

		expect(config.to).toEqual(['contact@example.com']);
		expect(config.from).toBe('noreply@example.com');
	});

	it('throws when required values are missing', () => {
		delete process.env.TO_EMAIL;
		delete process.env.EMAIL_FROM;
		delete process.env.CONTACT_EMAIL_TO;
		delete process.env.CONTACT_EMAIL_FROM;

		expect(() => readEmailConfig()).toThrowError('EMAIL_CONFIG_INVALID');
	});
});
