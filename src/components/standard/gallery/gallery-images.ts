import {
	fullSource,
	type PictureLike,
	thumbnailSource,
} from '@/utils/picture-src';
import type { GalleryImage } from './GalleryLightbox';

/** The gallery sits in the 8-of-12 column of the Report and Interview pages. */
const GALLERY_SIZES =
	'(min-width: 80rem) 52rem, (min-width: 48rem) 66vw, 100vw';

type GalleryPicture = PictureLike & { id: number; alt: string };

export const toGalleryImages = (pictures: GalleryPicture[]): GalleryImage[] =>
	pictures
		.filter((picture) => picture.url)
		.map((picture) => ({
			id: picture.id,
			source: fullSource(picture, GALLERY_SIZES),
			thumbnail: thumbnailSource(picture),
			alt: picture.alt,
			caption: picture.alt,
		}));
