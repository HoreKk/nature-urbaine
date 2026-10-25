export const idOf = (value: number | { id: number } | null | undefined) =>
	typeof value === 'object' ? value?.id : value;
