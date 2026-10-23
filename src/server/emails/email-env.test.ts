import { afterEach, describe, expect, it } from 'vitest';
import { readEmailConfig } from './email-env';

const ORIGINAL_ENV = process.env;

describe('readEmailConfig', () => {
	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	it('parses a comma-separated recipient list', () => {
		process.env.TO_EMAIL = 'ops@example.com, team@example.com';

		const config = readEmailConfig();

		expect(config.to).toEqual(['ops@example.com', 'team@example.com']);
	});

	it('throws when no recipient is set', () => {
		delete process.env.TO_EMAIL;

		expect(() => readEmailConfig()).toThrowError('EMAIL_CONFIG_INVALID');
	});
});
