import type { ImageSize } from "payload";

/** Pages pick `medium`/`large` via `srcSet`, never the original. */
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
