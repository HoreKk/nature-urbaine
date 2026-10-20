import { describe, expect, it } from 'vitest';
import { fullSource, heroSource, thumbnailSource } from './picture-src';

const picture = {
	url: 'https://bucket.test/pictures/parc.png?sig=1',
	width: 4000,
	height: 3000,
	variants: {
		thumbnail: {
			url: 'https://bucket.test/pictures/parc-400x300.png?sig=2',
			width: 400,
			height: 300,
		},
	},
};

describe('thumbnailSource', () => {
	it('prefers the generated thumbnail and never lists the original', () => {
		const source = thumbnailSource(picture);
		expect(source.src).toBe(picture.variants.thumbnail.url);
		expect(source.width).toBe(400);
		expect(source.height).toBe(300);
		expect(source.srcSet).toBeUndefined();
	});

	it('falls back to the original when no thumbnail exists', () => {
		const source = thumbnailSource({ ...picture, variants: undefined });
		expect(source.src).toBe(picture.url);
		expect(source.width).toBe(4000);
	});
});

const withVariants = {
	...picture,
	variants: {
		...picture.variants,
		medium: {
			url: 'https://bucket.test/pictures/parc-1024x768.webp?sig=3',
			width: 1024,
			height: 768,
		},
		large: {
			url: 'https://bucket.test/pictures/parc-2048x1536.webp?sig=4',
			width: 2048,
			height: 1536,
		},
	},
};

describe('fullSource', () => {
	it('falls back to the original alone when a row has no variants', () => {
		const source = fullSource(picture);
		expect(source.src).toBe(picture.url);
		expect(source.srcSet).toBeUndefined();
		expect(source.width).toBe(4000);
	});

	it('offers medium and large, never the original nor the crop', () => {
		const source = fullSource(withVariants, '50vw');
		expect(source.src).toBe(withVariants.variants.large.url);
		expect(source.srcSet).toBe(
			`${withVariants.variants.medium.url} 1024w, ${withVariants.variants.large.url} 2048w`,
		);
		expect(source.sizes).toBe('50vw');
		expect(source.width).toBe(2048);
		expect(source.height).toBe(1536);
	});

	it('lists one candidate per width when the original is small', () => {
		const small = {
			...withVariants,
			variants: {
				medium: { url: 'a.webp', width: 800, height: 600 },
				large: { url: 'b.webp', width: 800, height: 600 },
			},
		};
		const source = fullSource(small);
		expect(source.src).toBe('a.webp');
		expect(source.srcSet).toBeUndefined();
	});
});

describe('heroSource', () => {
	it('offers the thumbnail as a smaller candidate for cover-fit heroes', () => {
		const source = heroSource(picture, '(min-width: 62em) 66vw, 100vw');
		expect(source.src).toBe(picture.url);
		expect(source.srcSet).toBe(
			`${picture.variants.thumbnail.url} 400w, ${picture.url} 4000w`,
		);
		expect(source.sizes).toBe('(min-width: 62em) 66vw, 100vw');
	});

	it('uses the uncropped variants instead of the original once they exist', () => {
		const source = heroSource(withVariants);
		expect(source.srcSet).toBe(
			`${picture.variants.thumbnail.url} 400w, ${withVariants.variants.medium.url} 1024w, ${withVariants.variants.large.url} 2048w`,
		);
		expect(source.src).toBe(withVariants.variants.large.url);
	});

	it('skips srcSet when the thumbnail is not smaller than the original', () => {
		expect(heroSource({ ...picture, width: 300 }).srcSet).toBeUndefined();
	});
});
