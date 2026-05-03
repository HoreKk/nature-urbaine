import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig, type Plugin } from "payload";
import sharp from "sharp";

import { Categories } from "./collections/Category";
import { Interviews } from "./collections/Interview";
import { Media } from "./collections/Media";
import { Pictures } from "./collections/Picture";
import { Reports } from "./collections/Report";
import { Submissions } from "./collections/Submission";
import { Tags } from "./collections/Tag";
import { TagCategories } from "./collections/TagCategory";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const packageDir = path.dirname(filename);

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (!value) return fallback;
	return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function buildEmailAdapter() {
	if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) return undefined;

	const smtpUser = process.env.SMTP_USER;
	const smtpPass = process.env.SMTP_PASS;
	const hasAuth = Boolean(smtpUser && smtpPass);

	return nodemailerAdapter({
		defaultFromAddress:
			process.env.CONTACT_EMAIL_FROM ?? "no-reply@nature-urbaine.fr",
		defaultFromName: process.env.CONTACT_EMAIL_FROM_NAME ?? "Nature Urbaine",
		transportOptions: {
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			secure: parseBoolean(process.env.SMTP_SECURE, false),
			auth: hasAuth
				? {
						user: smtpUser,
						pass: smtpPass,
					}
				: undefined,
		},
	});
}

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
			Submissions,
			Tags,
			TagCategories,
			Users,
		],
		editor: lexicalEditor(),
		secret: process.env.PAYLOAD_SECRET || "",
		email: buildEmailAdapter(),
		typescript: {
			outputFile: path.resolve(packageDir, "./payload-types.ts"),
		},
		db: postgresAdapter({
			pool: {
				connectionString: process.env.DATABASE_URL || "",
			},
		}),
		sharp,
		cors: [
			"http://localhost:3000",
			"http://localhost:3001",
			...(process.env.RAILWAY_PUBLIC_DOMAIN
				? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
				: []),
			...(process.env.WEBSITE_DOMAIN
				? [`https://${process.env.WEBSITE_DOMAIN}`]
				: []),
		],
		csrf: [
			"http://localhost:3000",
			"http://localhost:3001",
			...(process.env.RAILWAY_PUBLIC_DOMAIN
				? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
				: []),
			...(process.env.WEBSITE_DOMAIN
				? [`https://${process.env.WEBSITE_DOMAIN}`]
				: []),
		],
		plugins,
	});
