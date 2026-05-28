import { buildPayloadConfig } from "./config";

// Canonical config for admin/write tooling such as the seed scripts. Seeding
// (notably `seed:dev`, which drops the database) relies on Payload's dev schema
// push to (re)create the schema, so push is left at its default here.
export default buildPayloadConfig();
