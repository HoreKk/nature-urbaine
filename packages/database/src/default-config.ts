import { buildPayloadConfig } from "./config";

// For write tooling: `seed:dev` drops the database and relies on Payload's
// default dev push to recreate the schema.
export default buildPayloadConfig();
