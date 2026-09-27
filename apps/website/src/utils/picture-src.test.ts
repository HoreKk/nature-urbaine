import { describe, expect, it } from 'vitest';
import { fullSource, heroSource, thumbnailSource } from './picture-src';

const picture = {
	url: 'https://bucket.test/pictures/parc.png?sig=1',
	width: 4000,
	height: 3000,
	sizes: {
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
		expect(source.src).toBe(picture.sizes.thumbnail.url);
		expect(source.width).toBe(400);
		expect(source.height).toBe(300);
		expect(source.srcSet).toBeUndefined();
	});

	it('falls back to the original when no thumbnail exists', () => {
		const source = thumbnailSource({ ...picture, sizes: undefined });
		expect(source.src).toBe(picture.url);
		expect(source.width).toBe(4000);
	});
});

describe('fullSource', () => {
	it('never offers the cropped thumbnail for contain-fit images', () => {
		const source = fullSource(picture);
		expect(source.src).toBe(picture.url);
		expect(source.srcSet).toBeUndefined();
		expect(source.width).toBe(4000);
	});
});

describe('heroSource', () => {
	it('offers the thumbnail as a smaller candidate for cover-fit heroes', () => {
		const source = heroSource(picture, '(min-width: 62em) 66vw, 100vw');
		expect(source.src).toBe(picture.url);
		expect(source.srcSet).toBe(
			`${picture.sizes.thumbnail.url} 400w, ${picture.url} 4000w`,
		);
		expect(source.sizes).toBe('(min-width: 62em) 66vw, 100vw');
	});

	it('skips srcSet when the thumbnail is not smaller than the original', () => {
		expect(heroSource({ ...picture, width: 300 }).srcSet).toBeUndefined();
	});
});
