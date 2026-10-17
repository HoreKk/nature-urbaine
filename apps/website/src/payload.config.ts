import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPayloadConfig } from '@nature-urbaine/database/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// The single Payload instance of the app: it serves the admin (`/admin`),
// the REST/GraphQL API (`/api`) and the website's server functions. Schema
// changes go through migrations only, never dev push.
export default buildPayloadConfig({
	importMapBaseDir: dirname,
	push: false,
});
