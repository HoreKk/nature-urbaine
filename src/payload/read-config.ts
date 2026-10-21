import { buildPayloadConfig } from './config';

// Schema changes go through migrations only: push would hang on Drizzle's
// data-loss prompt under `vite dev` whenever the local DB drifts.
export default buildPayloadConfig({ push: false });
