const frenchNumberFormatter = new Intl.NumberFormat('fr-FR');

export function joinNonEmpty(values: Array<string | null | undefined>) {
	return values.filter(Boolean).join(', ');
}

export function formatOptionalDate(
	value: string | Date,
	options?: Intl.DateTimeFormatOptions,
) {
	return new Date(value).toLocaleDateString('fr-FR', options);
}

export function formatOptionalNumber(value: number | null | undefined) {
	if (value === undefined || value === null) return '';
	return frenchNumberFormatter.format(value);
}

export function formatOptionalInteger(value: number | null | undefined) {
	if (value === undefined || value === null) return '';
	return Math.trunc(value).toString();
}

export function formatDepartmentLabel(
	departmentCode: string | null | undefined,
	department: string | null | undefined,
) {
	return [departmentCode, department].filter(Boolean).join(' - ');
}

export function stripExtension(filename: string) {
	return filename.replace(/\.[^.]+$/, '');
}

/** Strips diacritics and lowercases — useful for accent-insensitive comparisons. */
export function normalizeString(str: string): string {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}
