/**
 * Picks which file an `<img>` should load from a Payload upload doc whose
 * URLs were already made browser-fetchable by `server/media-urls.ts`.
 */

/** Minimal shape shared by Payload upload docs (`Picture`, `Media`). */
export type PictureLike = {
	url?: string | null;
	width?: number | null;
	height?: number | null;
	sizes?: {
		thumbnail?: {
			url?: string | null;
			width?: number | null;
			height?: number | null;
		} | null;
	} | null;
};

export type ImageSource = {
	src: string;
	srcSet?: string;
	sizes?: string;
	width?: number;
	height?: number;
};

const dimension = (value: number | null | undefined): number | undefined =>
	typeof value === 'number' && value > 0 ? value : undefined;

/**
 * Cards and grids: the 400×300 `thumbnail` Payload already generated, falling
 * back to the original for docs uploaded before the size existed. The
 * original is deliberately absent from `srcSet`, so a high-DPR screen cannot
 * pull a multi-megabyte file for a 300px card.
 */
export function thumbnailSource(picture: PictureLike): ImageSource {
	const thumbnail = picture.sizes?.thumbnail;
	if (thumbnail?.url) {
		return {
			src: thumbnail.url,
			width: dimension(thumbnail.width),
			height: dimension(thumbnail.height),
		};
	}
	return {
		src: picture.url ?? '',
		width: dimension(picture.width),
		height: dimension(picture.height),
	};
}

/**
 * Carousels and lightboxes: the original, alone. The thumbnail is centre-
 * cropped, so it must not be offered as a `srcSet` candidate for images shown
 * with `object-fit: contain` — the browser could pick it and show a crop.
 */
export function fullSource(picture: PictureLike): ImageSource {
	return {
		src: picture.url ?? '',
		width: dimension(picture.width),
		height: dimension(picture.height),
	};
}

/**
 * Full-bleed heroes rendered with `object-fit: cover` only. The cropped
 * thumbnail is a valid candidate there, so it is offered in `srcSet` and
 * narrow viewports skip the full-size file. `sizes` describes the rendered
 * width (defaults to the full viewport).
 */
export function heroSource(picture: PictureLike, sizes = '100vw'): ImageSource {
	const original = fullSource(picture);
	const thumbnail = picture.sizes?.thumbnail;
	const thumbnailWidth = dimension(thumbnail?.width);
	if (
		thumbnail?.url &&
		thumbnailWidth &&
		original.width &&
		original.width > thumbnailWidth
	) {
		return {
			...original,
			srcSet: `${thumbnail.url} ${thumbnailWidth}w, ${original.src} ${original.width}w`,
			sizes,
		};
	}
	return original;
}
