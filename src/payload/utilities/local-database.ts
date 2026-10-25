// `db` is the Postgres service name when a script runs inside docker compose.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'db']);

/** Throws unless `DATABASE_URL` points at a local database. */
export function assertLocalDatabase(command: string) {
	const host = URL.parse(process.env.DATABASE_URL ?? '')?.hostname;
	if (!host || !LOCAL_HOSTS.has(host)) {
		throw new Error(
			`${command} refuses a non-local DATABASE_URL (host "${host ?? 'none'}").`,
		);
	}
}
