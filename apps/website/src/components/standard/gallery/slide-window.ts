/**
 * Whether slide `index` is within `radius` of `current` in a looping carousel
 * of `count` slides. Only those slides mount their `<img>`: a report can hold
 * 200+ photos, and every decoded image costs memory even when off-screen.
 */
export function isNearSlide(
	index: number,
	current: number,
	count: number,
	radius = 1,
): boolean {
	const distance = Math.abs(index - current);
	return Math.min(distance, count - distance) <= radius;
}

/** `index + delta`, wrapped into `[0, count)`. */
export function wrapIndex(index: number, count: number): number {
	return ((index % count) + count) % count;
}
