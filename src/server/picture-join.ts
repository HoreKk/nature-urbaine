/** The first photo of an owner's ordered join is its Vignette (banner + card). */
export function frontPictureOf<P extends object>(
	join: { docs?: (number | P)[] } | null | undefined,
): P | null {
	const first = join?.docs?.[0];
	return first && typeof first === 'object' ? first : null;
}

// Galleries can hold 200+ pictures: populate only what they render, skipping
// tags and unused signed URLs (`original`, `thumbnailURL`).
export const galleryPicturePopulate = {
	alt: true,
	url: true,
	filename: true,
	mimeType: true,
	width: true,
	height: true,
	prefix: true,
	_objectKey: true,
	variants: true,
} as const;
