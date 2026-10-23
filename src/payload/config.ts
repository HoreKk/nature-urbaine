import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { resendAdapter } from '@payloadcms/email-resend';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { sharpTransformer } from '@payloadcms/transformer-sharp';
import { fr } from '@payloadcms/translations/languages/fr';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Categories } from './collections/Category';
import { Interviews } from './collections/Interview';
import { InterviewPictures } from './collections/InterviewPicture';
import { Media } from './collections/Media';
import { Pictures } from './collections/Picture';
import { Reports } from './collections/Report';
import { Submissions } from './collections/Submission';
import { Tags } from './collections/Tag';
import { TagCategories } from './collections/TagCategory';
import { Users } from './collections/Users';
import { pictureVariants } from './image-variants';
import { storageAdapter, storageCoverageGuard } from './storage';

// One process serves site, admin and uploads: libvips' cache and per-core threads
// add hundreds of MB of RSS per ~50 MB decode. Uploads are rare; keep them lean.
sharp.cache(false);
sharp.concurrency(1);

// Same processing for every image upload collection.
const imageTransform = {
	crop: true,
	focalPoint: true,
	variants: pictureVariants,
};

const filename = fileURLToPath(import.meta.url);
const payloadDir = path.dirname(filename);

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
	if (!value) return fallback;
	return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function buildEmailAdapter() {
	const defaultFromAddress =
		process.env.EMAIL_FROM ?? 'no-reply@nature-urbaine.com';
	const defaultFromName = process.env.EMAIL_FROM_NAME ?? 'Nature Urbaine';

	// Railway blocks SMTP below Pro, so production sends over Resend's HTTPS API.
	if (process.env.RESEND_API_KEY) {
		return resendAdapter({
			apiKey: process.env.RESEND_API_KEY,
			defaultFromAddress,
			defaultFromName,
		});
	}

	if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) return undefined;

	const smtpUser = process.env.SMTP_USER;
	const smtpPass = process.env.SMTP_PASS;
	const hasAuth = Boolean(smtpUser && smtpPass);

	return nodemailerAdapter({
		defaultFromAddress,
		defaultFromName,
		// Payload awaits the verify at boot; an unreachable SMTP host (Railway blocks
		// SMTP below Pro) stalled boot 2 min. A real send still fails, after 10 s.
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
	/** Undefined keeps Payload's default dev push. */
	push?: boolean;
}

export const buildPayloadConfig = ({ push }: BuildPayloadConfigOptions = {}) =>
	buildConfig({
		admin: {
			user: Users.slug,
			importMap: {
				// Component paths like `/payload/admin/PictureNav` resolve from `src/`.
				baseDir: path.resolve(payloadDir, '..'),
			},
		},
		i18n: {
			fallbackLanguage: 'fr',
			supportedLanguages: { fr },
		},
		// TanStack Start mode serves the admin at the fixed `/admin` route.
		routes: {
			admin: '/admin',
		},
		// v4 lowered the default from 2 to 1; the website's queries rely on 2.
		defaultDepth: 2,
		graphQL: { disable: true },
		collections: [
			Media,
			Reports,
			Interviews,
			Pictures,
			InterviewPictures,
			Categories,
			Submissions,
			Tags,
			TagCategories,
			Users,
		],
		editor: lexicalEditor(),
		secret: process.env.PAYLOAD_SECRET || '',
		email: buildEmailAdapter(),
		typescript: {
			outputFile: path.resolve(payloadDir, './payload-types.ts'),
		},
		db: postgresAdapter({
			...(push === undefined ? {} : { push }),
			pool: {
				connectionString: process.env.DATABASE_URL || '',
			},
			migrationDir: path.resolve(payloadDir, './migrations'),
			generateSchemaOutputFile: path.resolve(
				payloadDir,
				'./payload-generated-schema.ts',
			),
		}),
		upload: {
			transformers: [
				sharpTransformer({
					sharp,
					collections: {
						media: imageTransform,
						pictures: imageTransform,
						'interview-pictures': imageTransform,
					},
				}),
			],
		},
		storage: [storageAdapter()],
		// Origins whose admin cookie Payload accepts. Leaving this empty would
		// accept it from any origin, so it stays even with a single app.
		csrf: [
			'http://localhost:3000',
			...(process.env.RAILWAY_PUBLIC_DOMAIN
				? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
				: []),
			...(process.env.WEBSITE_DOMAIN
				? [`https://${process.env.WEBSITE_DOMAIN}`]
				: []),
		],
		plugins: [storageCoverageGuard],
	});
