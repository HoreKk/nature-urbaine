import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	claimStagingUpload,
	presignStagingUpload,
} from './contribution-uploads';

vi.mock('@aws-sdk/s3-request-presigner', () => ({
	getSignedUrl: async () => 'https://bucket.test/signed',
}));

describe('claimStagingUpload', () => {
	beforeEach(() => {
		vi.stubEnv('S3_BUCKET', 'test');
		vi.stubEnv('S3_ENDPOINT', 'https://bucket.test');
		vi.stubEnv('S3_ACCESS_KEY', 'key');
		vi.stubEnv('S3_SECRET_KEY', 'secret');
	});

	it('claims a handed-out key once', async () => {
		const { key } = await presignStagingUpload(1);
		expect(claimStagingUpload(key)).toBe(true);
		expect(claimStagingUpload(key)).toBe(false);
	});

	it('refuses a key it never handed out', () => {
		expect(
			claimStagingUpload(
				'contribution-uploads/00000000-0000-0000-0000-000000000000.zip',
			),
		).toBe(false);
	});

	it('refuses a key once its upload URL has expired', async () => {
		const { key } = await presignStagingUpload(1);
		expect(claimStagingUpload(key, Date.now() + 11 * 60 * 1000)).toBe(false);
	});
});
