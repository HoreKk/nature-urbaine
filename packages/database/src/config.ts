import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { sharpTransformer } from "@payloadcms/transformer-sharp";
import { fr } from "@payloadcms/translations/languages/fr";
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
import { pictureVariants } from "./image-variants";
import { storageAdapter, storageCoverageGuard } from "./storage";

// One web process serves the site, the admin and upload processing. A
// ~4000×3000 original decodes to ~50 MB of pixels and each upload renders
// three variants, so libvips' cache and one thread per core push RSS up by
// hundreds of MB that the allocator rarely hands back. Uploads are rare;
// keep them slow and lean instead.
sharp.cache(false);
sharp.concurrency(1);

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
		// Payload awaits the verify before it finishes starting, so an
		// unreachable SMTP host (Railway blocks SMTP below the Pro plan) held
		// every boot and pre-deploy command for nodemailer's 2-minute default.
		// A real send still surfaces the failure, after 10 s instead.
		skipVerify: true,
		transportOptions: {
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT),
			connectionTimeout: 10_000,
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
	/**
	 * Controls Drizzle dev schema push. Leave undefined to keep Payload's
	 * default (push in development). Consumers that only read the DB — e.g. the
	 * website — should pass `false` so they never attempt to sync the schema
	 * (which would otherwise propose dropping columns their config doesn't
	 * declare, such as the S3 `prefix` fields, and hang on the data-loss prompt).
	 */
	push?: boolean;
}

export const buildPayloadConfig = ({
	importMapBaseDir,
	plugins = [],
	push,
}: BuildPayloadConfigOptions = {}) =>
	buildConfig({
		admin: {
			user: Users.slug,
			importMap: {
				baseDir: importMapBaseDir ?? packageDir,
			},
		},
		i18n: {
			fallbackLanguage: "fr",
			supportedLanguages: { fr },
		},
		// TanStack Start mode serves the admin at the fixed `/admin` route.
		routes: {
			admin: "/admin",
		},
		// v4 lowered the default from 2 to 1; the website's queries rely on 2.
		defaultDepth: 2,
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
			...(push === undefined ? {} : { push }),
			pool: {
				connectionString: process.env.DATABASE_URL || "",
			},
			migrationDir: path.resolve(packageDir, "./migrations"),
		}),
		upload: {
			transformers: [
				sharpTransformer({
					sharp,
					collections: {
						media: { crop: true, focalPoint: true },
						pictures: {
							crop: true,
							focalPoint: true,
							variants: pictureVariants,
						},
					},
				}),
			],
		},
		storage: [storageAdapter()],
		// Origins whose admin cookie Payload accepts. Leaving this empty would
		// accept it from any origin, so it stays even with a single app.
		csrf: [
			"http://localhost:3000",
			...(process.env.RAILWAY_PUBLIC_DOMAIN
				? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
				: []),
			...(process.env.WEBSITE_DOMAIN
				? [`https://${process.env.WEBSITE_DOMAIN}`]
				: []),
		],
		plugins: [...plugins, storageCoverageGuard],
	});
