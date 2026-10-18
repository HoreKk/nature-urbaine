/**
 * Picks which file an `<img>` should load from a Payload upload doc whose
 * URLs were already made browser-fetchable by `server/media-urls.ts`.
 */

type VariantLike = {
	url?: string | null;
	width?: number | null;
	height?: number | null;
} | null;

/** Minimal shape shared by Payload upload docs (`Picture`, `Media`). */
export type PictureLike = {
	url?: string | null;
	width?: number | null;
	height?: number | null;
	variants?: {
		/** 400×300 centre crop. */
		thumbnail?: VariantLike;
		/** Uncropped WebP, 1024px wide at most. */
		medium?: VariantLike;
		/** Uncropped WebP, 2048px wide at most. */
		large?: VariantLike;
	} | null;
};

export type ImageSource = {
	src: string;
	srcSet?: string;
	sizes?: string;
	width?: number;
	height?: number;
};

type Candidate = { url: string; width: number; height?: number };

const dimension = (value: number | null | undefined): number | undefined =>
	typeof value === 'number' && value > 0 ? value : undefined;

function candidate(variant: VariantLike | undefined): Candidate | null {
	const width = dimension(variant?.width);
	if (!variant?.url || !width) return null;
	return { url: variant.url, width, height: dimension(variant.height) };
}

/**
 * The uncropped variants, smallest first, one per width: `withoutEnlargement`
 * gives `medium` and `large` the same width when the original is small.
 */
function uncroppedCandidates(picture: PictureLike): Candidate[] {
	const byWidth = new Map<number, Candidate>();
	for (const variant of [picture.variants?.medium, picture.variants?.large]) {
		const found = candidate(variant);
		if (found && !byWidth.has(found.width)) byWidth.set(found.width, found);
	}
	return [...byWidth.values()].toSorted((a, b) => a.width - b.width);
}

function toSource(candidates: Candidate[], sizes: string): ImageSource {
	const largest = candidates[candidates.length - 1]!;
	return {
		src: largest.url,
		width: largest.width,
		height: largest.height,
		...(candidates.length > 1
			? {
					srcSet: candidates.map((c) => `${c.url} ${c.width}w`).join(', '),
					sizes,
				}
			: {}),
	};
}

const original = (picture: PictureLike): ImageSource => ({
	src: picture.url ?? '',
	width: dimension(picture.width),
	height: dimension(picture.height),
});

/**
 * Cards and grids: the 400×300 `thumbnail` Payload already generated, falling
 * back to the original for docs uploaded before the size existed. The
 * original is deliberately absent from `srcSet`, so a high-DPR screen cannot
 * pull a multi-megabyte file for a 300px card.
 */
export function thumbnailSource(picture: PictureLike): ImageSource {
	const thumbnail = picture.variants?.thumbnail;
	if (thumbnail?.url) {
		return {
			src: thumbnail.url,
			width: dimension(thumbnail.width),
			height: dimension(thumbnail.height),
		};
	}
	return original(picture);
}

/**
 * Carousels, lightboxes and banners: the uncropped `medium`/`large` variants,
 * chosen by the browser from `sizes` (the rendered width). The original is
 * never a candidate once a variant exists, and the cropped thumbnail never is,
 * so `object-fit: contain` cannot show a crop. Docs not backfilled yet fall
 * back to the original alone.
 */
export function fullSource(picture: PictureLike, sizes = '100vw'): ImageSource {
	const candidates = uncroppedCandidates(picture);
	return candidates.length > 0
		? toSource(candidates, sizes)
		: original(picture);
}

/**
 * Full-bleed heroes rendered with `object-fit: cover` only. Like
 * `fullSource`, plus the cropped thumbnail as the smallest candidate, which is
 * valid under `cover`; without uncropped variants the original is the largest.
 */
export function heroSource(picture: PictureLike, sizes = '100vw'): ImageSource {
	const uncropped = uncroppedCandidates(picture);
	const top: Candidate[] =
		uncropped.length > 0
			? uncropped
			: picture.url && dimension(picture.width)
				? [
						{
							url: picture.url,
							width: dimension(picture.width)!,
							height: dimension(picture.height),
						},
					]
				: [];
	if (top.length === 0) return original(picture);
	const thumbnail = candidate(picture.variants?.thumbnail);
	const candidates =
		thumbnail && thumbnail.width < top[0]!.width ? [thumbnail, ...top] : top;
	// Keep the hero's own aspect ratio for `width`/`height`, not the crop's.
	return toSource(candidates, sizes);
}
