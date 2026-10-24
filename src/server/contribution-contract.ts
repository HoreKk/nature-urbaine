import { z } from 'zod';
import { formGuardFields } from './form-guard-contract';

/** Error codes the page turns into messages. */
export const ARCHIVE_INVALID = 'ARCHIVE_INVALID';
export const ARCHIVE_MISSING = 'ARCHIVE_MISSING';
export const UPLOADS_UNAVAILABLE = 'UPLOADS_UNAVAILABLE';

export const CONTRIBUTION_MAX_PICTURES = 50;
export const CONTRIBUTION_DESCRIPTION_MAX_LENGTH = 500;
export const CONTRIBUTION_DELIVERY_YEAR_MIN = 1900;
export const CONTRIBUTION_DELIVERY_YEAR_MAX = 2100;
/** Before downscaling: photographers' originals routinely weigh 10–25 Mo. */
export const CONTRIBUTION_MAX_SOURCE_PICTURE_BYTES = 30 * 1024 * 1024;
export const CONTRIBUTION_MAX_SOURCE_PICTURE_LABEL = '30 Mo';
/** Long edge after downscaling; the site never shows more than 2048 px. */
export const CONTRIBUTION_PICTURE_MAX_EDGE = 2560;
/** 50 downscaled JPEGs land around 50–100 Mo; the zip stores them uncompressed. */
export const CONTRIBUTION_MAX_ARCHIVE_BYTES = 200 * 1024 * 1024;

const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Filled from the address search; empty when the address was typed freely. */
export const contributionLocationSchema = z.object({
	address: optionalText(300),
	city: optionalText(100),
	postalCode: optionalText(10),
	departmentCode: optionalText(5),
	department: optionalText(100),
	region: optionalText(100),
	country: optionalText(100),
});

const deliveryYearRangeMessage = `L'année de livraison doit être entre ${CONTRIBUTION_DELIVERY_YEAR_MIN} et ${CONTRIBUTION_DELIVERY_YEAR_MAX}`;

const deliveryYearSchema = z
	.number()
	.int()
	.min(CONTRIBUTION_DELIVERY_YEAR_MIN, deliveryYearRangeMessage)
	.max(CONTRIBUTION_DELIVERY_YEAR_MAX, deliveryYearRangeMessage);

const contributionFieldsSchema = z.object({
	title: z.string().trim().min(1, 'Le titre du projet est requis').max(200),
	description: z
		.string()
		.trim()
		.max(
			CONTRIBUTION_DESCRIPTION_MAX_LENGTH,
			`La description ne doit pas dépasser ${CONTRIBUTION_DESCRIPTION_MAX_LENGTH} caractères`,
		)
		.optional(),
	projectOwner: optionalText(200),
	projectManagement: optionalText(200),
	projectCost: optionalText(100),
	projectArea: optionalText(100),
	location: contributionLocationSchema,
	authorName: z
		.string()
		.trim()
		.min(1, 'Le nom de l’auteur des photographies est requis')
		.max(120),
	authorEmail: z.string().trim().email('Adresse email invalide').max(254),
	consent: z.literal(true, {
		message: 'Votre accord est nécessaire pour publier les photographies',
	}),
});

export const clientContributionSchema = contributionFieldsSchema.extend({
	category: z.string().min(1, 'La catégorie est requise'),
	// The text input gives a string; empty means "not given".
	deliveryYear: z.union([
		z.literal(''),
		z.coerce.number().pipe(deliveryYearSchema),
	]),
	pictures: z
		.array(
			z
				.instanceof(File)
				.refine((file) => file.type.startsWith('image/'), {
					message: 'Seules les images sont acceptées',
				})
				.refine((file) => file.size <= CONTRIBUTION_MAX_SOURCE_PICTURE_BYTES, {
					message: `Chaque photo doit faire ${CONTRIBUTION_MAX_SOURCE_PICTURE_LABEL} maximum`,
				}),
		)
		.min(1, 'Ajoutez au moins une photo')
		.max(
			CONTRIBUTION_MAX_PICTURES,
			`Vous pouvez ajouter au maximum ${CONTRIBUTION_MAX_PICTURES} photos`,
		),
	honeypot: z.string().optional(),
});

export const prepareContributionUploadSchema = z.object({
	archiveSize: z.number().int().positive().max(CONTRIBUTION_MAX_ARCHIVE_BYTES),
	honeypot: z.string().optional(),
	...formGuardFields,
});

export const submitContributionSchema = contributionFieldsSchema.extend({
	category: z.number().int().min(1, 'La catégorie est requise'),
	deliveryYear: deliveryYearSchema.optional(),
	photosTakenAt: z.iso.datetime().optional(),
	/** Staging key handed out by `prepareContributionUpload`. */
	uploadKey: z.string().regex(/^contribution-uploads\/[0-9a-f-]{36}\.zip$/),
});

export type ClientContribution = z.infer<typeof clientContributionSchema>;
export type SubmitContribution = z.infer<typeof submitContributionSchema>;
export type ContributionLocation = z.infer<typeof contributionLocationSchema>;
