export function getBackendUrl(path: string | null | undefined): string {
	const base =
		import.meta.env.VITE_BACKEND_URL ||
		process.env.BACKEND_URL ||
		'http://localhost:3001';
	return `${base}${path || ''}`;
}
