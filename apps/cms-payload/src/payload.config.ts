import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPayloadConfig } from "@nature-urbaine/database/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildPayloadConfig({ importMapBaseDir: dirname });
