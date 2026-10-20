import { buildPayloadConfig } from "./config";

// For `seed:dev`, which drops the database and relies on Payload's default dev
// push to recreate the schema.
export default buildPayloadConfig();
