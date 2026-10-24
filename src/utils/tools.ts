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
	if (!department) return departmentCode ?? '';
	if (!departmentCode) return department;
	return `${department} (${departmentCode.slice(0, 2)})`;
}

export function stripExtension(filename: string) {
	return filename.replace(/\.[^.]+$/, '');
}

export function normalizeString(str: string): string {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

export function pickRandom<T>(items: readonly T[], count: number): T[] {
	const pool = [...items];
	const picked: T[] = [];
	while (picked.length < count && pool.length > 0) {
		const index = Math.floor(Math.random() * pool.length);
		picked.push(...pool.splice(index, 1));
	}
	return picked;
}
