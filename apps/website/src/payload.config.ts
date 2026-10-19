import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPayloadConfig } from '@nature-urbaine/database/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Schema changes go through migrations only, never dev push.
export default buildPayloadConfig({
	importMapBaseDir: dirname,
	push: false,
});
