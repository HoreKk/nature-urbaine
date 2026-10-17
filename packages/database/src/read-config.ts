import { buildPayloadConfig } from "./config";

// Config for consumers that never own the schema (the website,
// relation-resolving helpers). Dev schema push is disabled: they must never
// attempt to sync the schema, which would hang on Drizzle's interactive
// data-loss prompt under `vite dev` whenever the local DB drifts. Storage is
// shared with the CMS through `buildPayloadConfig`, so the website's
// submission uploads land in the bucket too.
export default buildPayloadConfig({ push: false });
