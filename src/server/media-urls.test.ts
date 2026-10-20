import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { objectKeyFromPath, signUploadUrl, withMediaUrls } from './media-urls';

const ORIGINAL_ENV = process.env;

const picture = {
	id: 1,
	alt: 'Parc',
	filename: 'parc a.png',
	url: '/api/pictures/file/parc%20a.png',
	thumbnailURL: '/api/pictures/file/parc%20a-400x300.png',
	width: 4000,
	height: 3000,
	variants: {
		thumbnail: {
			url: '/api/pictures/file/parc%20a-400x300.png',
			width: 400,
			height: 300,
			filename: 'parc a-400x300.png',
		},
	},
};

describe('withMediaUrls', () => {
	beforeEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});
	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	it('falls back to the CMS when no bucket is configured', async () => {
		delete process.env.S3_BUCKET;
		const result = await withMediaUrls({ docs: [picture] });
		expect(result.docs[0].url).toMatch(/\/api\/pictures\/file\/parc%20a\.png$/);
		expect(result.docs[0].variants.thumbnail.url).toMatch(/-400x300\.png$/);
	});

	describe('with a bucket', () => {
		beforeEach(() => {
			process.env.S3_BUCKET = 'nu-bucket';
			process.env.S3_ENDPOINT = 'https://t3.storageapi.dev';
			process.env.S3_ACCESS_KEY = 'AKIATEST';
			process.env.S3_SECRET_KEY = 'secret';
		});

		it('signs every upload URL, including nested variants and relations', async () => {
			const report = {
				id: 9,
				name: 'R',
				frontPicture: picture,
				tags: [{ id: 1 }],
			};
			const result = await withMediaUrls({ docs: [report], totalDocs: 1 });
			const front = result.docs[0].frontPicture;
			expect(front.url).toMatch(
				/^https:\/\/t3\.storageapi\.dev\/nu-bucket\/pictures\/parc%20a\.png\?/,
			);
			expect(front.url).toContain('X-Amz-Signature=');
			expect(front.url).toContain('X-Amz-Expires=604800');
			expect(front.url).toContain('response-cache-control=');
			expect(front.variants.thumbnail.url).toMatch(
				/\/pictures\/parc%20a-400x300\.png\?/,
			);
			expect(front.thumbnailURL).toMatch(/-400x300\.png\?/);
			expect(front.alt).toBe('Parc');
			expect(result.docs[0].tags).toEqual([{ id: 1 }]);
			expect(result.totalDocs).toBe(1);
		});

		it('produces the same URL for the whole UTC day, on any instance', async () => {
			const morning = Date.UTC(2026, 8, 27, 1, 0, 0);
			const evening = Date.UTC(2026, 8, 27, 23, 59, 0);
			const nextDay = Date.UTC(2026, 8, 28, 0, 1, 0);
			const a = await signUploadUrl('pictures/x.png', morning);
			const b = await signUploadUrl('pictures/x.png', evening);
			const c = await signUploadUrl('pictures/x.png', nextDay);
			expect(a).toBe(b);
			expect(a).toContain('X-Amz-Date=20260927T000000Z');
			expect(c).not.toBe(a);
		});

		it('leaves foreign URLs and non-upload objects alone', async () => {
			const value = {
				url: 'https://elsewhere.test/a.png',
				filename: 'a.png',
				nested: { url: '/api/reports/1' },
			};
			expect(await withMediaUrls(value)).toEqual(value);
		});

		it('signs absolute CMS URLs too (Payload serverURL set)', async () => {
			const doc = {
				...picture,
				url: 'https://cms.test/api/pictures/file/parc%20a.png',
			};
			const result = await withMediaUrls(doc);
			expect(result.url).toMatch(
				/^https:\/\/t3\.storageapi\.dev\/nu-bucket\/pictures\/parc%20a\.png\?/,
			);
		});

		it('signs URLs carrying ?prefix= (S3 plugin in the website config)', async () => {
			// Exact shape served in production on 2026-10-18, which broke images
			// (see #20), with v4's `variants` in place of `sizes`.
			const doc = {
				...picture,
				prefix: 'pictures',
				url: '/api/pictures/file/parc%20a.png?prefix=pictures',
				variants: {
					thumbnail: {
						...picture.variants.thumbnail,
						url: '/api/pictures/file/parc%20a-400x300.png?prefix=pictures',
					},
				},
			};
			const result = await withMediaUrls({ docs: [doc] });
			expect(result.docs[0].url).toMatch(
				/^https:\/\/t3\.storageapi\.dev\/nu-bucket\/pictures\/parc%20a\.png\?/,
			);
			expect(result.docs[0].variants.thumbnail.url).toMatch(
				/\/nu-bucket\/pictures\/parc%20a-400x300\.png\?/,
			);
		});

		it('signs Payload 4 uploads under <prefix>/<_objectKey>/', async () => {
			const doc = {
				id: 21,
				filename: 's3-test-original.png',
				url: '/api/pictures/file/s3-test-original.png?prefix=pictures',
				prefix: 'pictures',
				_objectKey: '2be7d0d4',
				variants: {
					thumbnail: {
						url: '/api/pictures/file/s3-test-original-400x300.png?prefix=pictures',
						filename: 's3-test-original-400x300.png',
						prefix: 'pictures',
						_objectKey: '2be7d0d4',
					},
				},
			};
			const result = await withMediaUrls(doc);
			expect(result.url).toMatch(
				/\/nu-bucket\/pictures\/2be7d0d4\/s3-test-original\.png\?/,
			);
			expect(result.variants.thumbnail.url).toMatch(
				/\/nu-bucket\/pictures\/2be7d0d4\/s3-test-original-400x300\.png\?/,
			);
		});

		it('keeps pre-upgrade and empty-prefix rows at <collection>/<file>', () => {
			expect(
				objectKeyFromPath('/api/pictures/file/a.png?prefix=pictures', {
					prefix: 'pictures',
					_objectKey: null,
				}),
			).toBe('pictures/a.png');
			// 77 prod `media` rows were stored before the prefix was configured.
			expect(objectKeyFromPath('/api/media/file/b.jpg', { prefix: '' })).toBe(
				'media/b.jpg',
			);
		});

		it('keeps Date and other class instances intact', async () => {
			const when = new Date('2026-09-27T10:00:00Z');
			const result = await withMediaUrls({ when, docs: [picture] });
			expect(result.when).toBe(when);
			expect(result.docs[0].url).toContain('X-Amz-Signature=');
		});
	});
});
