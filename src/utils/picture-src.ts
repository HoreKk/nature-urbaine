// Input URLs are already browser-fetchable (signed by `server/media-urls.ts`).

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

/** Deduped by width: `withoutEnlargement` gives `medium` and `large` the same width on small originals. */
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

/** No `srcSet` with the original, so a high-DPR screen cannot pull a multi-megabyte file for a 300px card. */
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

/** Never the cropped thumbnail, so `object-fit: contain` cannot show a crop. */
export function fullSource(picture: PictureLike, sizes = '100vw'): ImageSource {
	const candidates = uncroppedCandidates(picture);
	return candidates.length > 0
		? toSource(candidates, sizes)
		: original(picture);
}

/** `object-fit: cover` only: that is what makes the cropped thumbnail a valid candidate. */
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
