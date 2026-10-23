import { getPayload } from 'payload';
import config from '../default-config';
import { assertLocalDatabase } from '../utils/local-database';

// `pnpm dev` runs with push off (read-config): Drizzle's data-loss prompt hangs
// under `vite dev`. Here it runs in a plain terminal, so it can ask.
assertLocalDatabase('db:push');

const payload = await getPayload({ config });
await payload.destroy();
