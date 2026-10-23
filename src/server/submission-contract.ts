import { z } from 'zod';
import { formGuardFields } from './form-guard-contract';

export const SUBMISSION_DESCRIPTION_MAX_LENGTH = 500;
export const SUBMISSION_DELIVERY_YEAR_MIN = 1900;
export const SUBMISSION_DELIVERY_YEAR_MAX = 2100;
export const SUBMISSION_MAX_PICTURES = 5;
export const SUBMISSION_MAX_PICTURE_SIZE_BYTES = 5 * 1024 * 1024;
export const SUBMISSION_MAX_PICTURE_SIZE_LABEL = '5 Mo';
// Base64 inflates bytes by 4/3: anything longer decodes past the size cap.
const MAX_PICTURE_BASE64_LENGTH =
	Math.ceil(SUBMISSION_MAX_PICTURE_SIZE_BYTES / 3) * 4;

const deliveryYearRangeMessage = `L'année de livraison doit être entre ${SUBMISSION_DELIVERY_YEAR_MIN} et ${SUBMISSION_DELIVERY_YEAR_MAX}`;

const baseSubmissionSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis').max(200),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(
			SUBMISSION_DESCRIPTION_MAX_LENGTH,
			`La description ne doit pas dépasser ${SUBMISSION_DESCRIPTION_MAX_LENGTH} caractères`,
		),
	address: z.string().min(1, "L'adresse est requise").max(300),
	contributorEmail: z.string().email('Adresse email invalide').max(254),
	honeypot: z.string().optional(),
});

function picturesArrayOf<T extends z.ZodTypeAny>(item: T) {
	return z
		.array(item)
		.min(1, 'Ajoutez au moins une image')
		.max(
			SUBMISSION_MAX_PICTURES,
			`Vous pouvez ajouter au maximum ${SUBMISSION_MAX_PICTURES} images`,
		);
}

export const clientSubmissionSchema = baseSubmissionSchema.extend({
	category: z.string().min(1, 'La catégorie est requise'),
	deliveryYear: z.coerce
		.number({ message: "L'année de livraison est requise" })
		.int()
		.min(SUBMISSION_DELIVERY_YEAR_MIN, deliveryYearRangeMessage)
		.max(SUBMISSION_DELIVERY_YEAR_MAX, deliveryYearRangeMessage),
	pictures: picturesArrayOf(
		z
			.instanceof(File)
			.refine((file) => file.type.startsWith('image/'), {
				message: 'Seules les images sont acceptées',
			})
			.refine((file) => file.size <= SUBMISSION_MAX_PICTURE_SIZE_BYTES, {
				message: `Chaque image doit faire ${SUBMISSION_MAX_PICTURE_SIZE_LABEL} maximum`,
			}),
	),
});

const wirePictureSchema = z.object({
	name: z.string().min(1).max(255),
	type: z.string().regex(/^image\//, 'Seules les images sont acceptées'),
	size: z.number().int().positive().max(SUBMISSION_MAX_PICTURE_SIZE_BYTES),
	base64: z.string().min(1).max(MAX_PICTURE_BASE64_LENGTH),
});

export const wireSubmissionSchema = baseSubmissionSchema.extend({
	category: z.number().int().min(1, 'La catégorie est requise'),
	deliveryYear: z
		.number()
		.int()
		.min(SUBMISSION_DELIVERY_YEAR_MIN, deliveryYearRangeMessage)
		.max(SUBMISSION_DELIVERY_YEAR_MAX, deliveryYearRangeMessage),
	locationDetails: z
		.object({
			city: z.string().max(100).optional(),
			postcode: z.string().max(10).optional(),
			department: z.string().max(100).optional(),
			region: z.string().max(100).optional(),
			citycode: z.string().max(10).optional(),
		})
		.optional(),
	pictures: picturesArrayOf(wirePictureSchema),
	...formGuardFields,
});

export type ClientSubmission = z.infer<typeof clientSubmissionSchema>;
export type WireSubmission = z.infer<typeof wireSubmissionSchema>;
export type WireSubmissionPicture = z.infer<typeof wirePictureSchema>;
