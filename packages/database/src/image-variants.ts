import type { ImageSize } from "payload";

/** Shared by `config.ts` and `scripts/backfill-variants.ts` so new and backfilled
 * uploads write the same files. Pages pick `medium`/`large` via `srcSet`, never the original. */
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
