/** Only slides in the window mount their `<img>`: a report can hold 200+ photos, each decoded one costing memory. */
export function isNearSlide(
	index: number,
	current: number,
	count: number,
	radius = 1,
): boolean {
	const distance = Math.abs(index - current);
	return Math.min(distance, count - distance) <= radius;
}

export function wrapIndex(index: number, count: number): number {
	return ((index % count) + count) % count;
}
