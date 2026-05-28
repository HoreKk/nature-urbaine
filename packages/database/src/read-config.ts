import { buildPayloadConfig } from "./config";

// Config for read-only consumers (the website, relation-resolving helpers).
// These only read from the database, so dev schema push is disabled: they must
// never attempt to sync the schema — doing so proposes dropping columns their
// config doesn't declare (e.g. the S3 `prefix` fields owned by the CMS config)
// and hangs on the interactive data-loss prompt under `vite dev`.
export default buildPayloadConfig({ push: false });
