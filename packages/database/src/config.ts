import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig, type Plugin } from "payload";
import sharp from "sharp";

import { Categories } from "./collections/Category";
import { Interviews } from "./collections/Interview";
import { Media } from "./collections/Media";
import { Pictures } from "./collections/Picture";
import { Reports } from "./collections/Report";
import { Tags } from "./collections/Tag";
import { TagCategories } from "./collections/TagCategory";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(filename);

export interface BuildPayloadConfigOptions {
	importMapBaseDir?: string;
	plugins?: Plugin[];
}

export const buildPayloadConfig = ({
	importMapBaseDir,
	plugins = [],
}: BuildPayloadConfigOptions = {}) =>
	buildConfig({
		admin: {
			user: Users.slug,
			importMap: {
				baseDir: importMapBaseDir ?? packageDir,
			},
		},
		routes: {
			admin: "/",
		},
		collections: [
			Media,
			Reports,
			Interviews,
			Pictures,
			Categories,
			Tags,
			TagCategories,
			Users,
		],
		editor: lexicalEditor(),
		secret: process.env.PAYLOAD_SECRET || "",
		typescript: {
			outputFile: path.resolve(packageDir, "./payload-types.ts"),
		},
		db: postgresAdapter({
			pool: {
				connectionString: process.env.DATABASE_URL || "",
			},
		}),
		sharp,
		cors: ["http://localhost:3000", "http://localhost:3001"],
		csrf: ["http://localhost:3000", "http://localhost:3001"],
		plugins,
	});
