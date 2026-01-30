import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import sharp from "sharp";
import { Categories } from "./collections/Category";
import { Media } from "./collections/Media";
import { Pictures } from "./collections/Picture";
import { Reports } from "./collections/Report";
import { Tags } from "./collections/Tag";
import { TagCategories } from "./collections/TagCategory";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [
		Media,
		Reports,
		Pictures,
		Categories,
		Tags,
		TagCategories,
		Users,
	],
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "./payload-types.ts"),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL || "",
		},
	}),
	sharp,
});
