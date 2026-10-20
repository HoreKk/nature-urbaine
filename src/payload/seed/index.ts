import { getPayload } from 'payload';
import config from '../default-config';
import seedCategories from './categories';
import seedInterviews from './interviews';
import seedReports from './reports';
import seedTags from './tags';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'db']);

const seed = async () => {
	// `seed:dev` drops the database: never let it reach a remote one.
	const host = new URL(process.env.DATABASE_URL ?? '').hostname;
	if (!LOCAL_HOSTS.has(host)) {
		throw new Error(`seed:dev refuses non-local database host "${host}".`);
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
