import {
	type Config,
	getPayload,
	payloadConfig,
} from '@nature-urbaine/database';

export function getBackendUrl(path: string | null | undefined): string {
	const base =
		import.meta.env.VITE_BACKEND_URL ||
		process.env.BACKEND_URL ||
		'http://localhost:3001';
	return `${base}${path || ''}`;
}

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
