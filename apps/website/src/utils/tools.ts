import {
	type Config,
	getPayload,
	payloadConfig,
} from '@nature-urbaine/database';

const frenchNumberFormatter = new Intl.NumberFormat('fr-FR');

export async function fetchOrReturnRealValue<
	T extends keyof Config['collections'],
>(
	item: number | Config['collections'][T],
	collection: T,
): Promise<Config['collections'][T]> {
	if (typeof item === 'number') {
		const payload = await getPayload({ config: payloadConfig });
		return (await payload.findByID({
			collection,
			id: item,
		})) as Config['collections'][T];
	} else {
		return item as Config['collections'][T];
	}
}

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
