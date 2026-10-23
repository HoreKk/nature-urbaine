import { getPayload } from 'payload';
import config from '../default-config';
import { assertLocalDatabase } from '../utils/local-database';
import seedCategories from './categories';
import seedInterviews from './interviews';
import seedReports from './reports';
import seedTags from './tags';

const seed = async () => {
	// `seed:dev` drops the database: never let it reach a remote one.
	assertLocalDatabase('seed:dev');

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
