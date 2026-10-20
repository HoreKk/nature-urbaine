import { buildPayloadConfig } from './config';

// For consumers that never own the schema: push would hang on Drizzle's
// data-loss prompt under `vite dev` whenever the local DB drifts.
export default buildPayloadConfig({ push: false });
