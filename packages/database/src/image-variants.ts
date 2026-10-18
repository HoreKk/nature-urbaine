import type { ImageSize } from "payload";

/**
 * Resized copies Payload stores next to every `pictures` upload, under the
 * doc's `variants`. Shared by `config.ts` (new uploads) and
 * `scripts/backfill-variants.ts` (rows uploaded before a variant existed), so
 * both write the same files.
 *
 * - `thumbnail`: 400×300 centre crop, for cards and grids (`object-fit: cover`).
 * - `medium` / `large`: the whole picture, never cropped nor enlarged, as WebP.
 *   The carousel, lightbox and report banner pick one through `srcSet`, so no
 *   page ever needs the multi-megabyte original (~4000×3000 in production).
 */
export const pictureVariants = [
	{
		name: "thumbnail",
		width: 400,
		height: 300,
		position: "centre",
	},
	{
		name: "medium",
		width: 1024,
		withoutEnlargement: true,
		formatOptions: { format: "webp", options: { quality: 78 } },
	},
	{
		name: "large",
		width: 2048,
		withoutEnlargement: true,
		formatOptions: { format: "webp", options: { quality: 80 } },
	},
] satisfies ImageSize[];

/** Variants a backfill can add to existing rows: the uncropped ones. */
export const backfillableVariants = pictureVariants.filter(
	(variant) => variant.name !== "thumbnail",
) as Extract<(typeof pictureVariants)[number], { formatOptions: unknown }>[];
