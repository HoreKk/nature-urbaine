import { getPayload } from 'payload';
import config from '../default-config';
import seedCategories from './categories';
import seedInterviews from './interviews';
import seedReports from './reports';
import seedTags from './tags';

// `db` is the Postgres service name when the seed runs inside docker compose.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'db']);

const seed = async () => {
	// `seed:dev` drops the database: never let it reach a remote one.
	const host = URL.parse(process.env.DATABASE_URL ?? '')?.hostname;
	if (!host || !LOCAL_HOSTS.has(host)) {
		throw new Error(
			`seed:dev refuses a non-local DATABASE_URL (host "${host ?? 'none'}").`,
		);
	}

	const payload = await getPayload({ config });

	await payload.create({
		collection: 'users',
		data: { email: 'admin@test.loc', password: 'admin123' },
		overrideAccess: true,
	});

	await seedCategories(payload);
	await seedReports(payload);
	await seedInterviews(payload);
	await seedTags(payload);
};

await seed();
