import { z } from 'zod';

export const SUBMISSION_DESCRIPTION_MAX_LENGTH = 500;
export const SUBMISSION_DELIVERY_YEAR_MIN = 1900;
export const SUBMISSION_DELIVERY_YEAR_MAX = 2100;
export const SUBMISSION_MAX_PICTURES = 5;
export const SUBMISSION_MAX_PICTURE_SIZE_BYTES = 5 * 1024 * 1024;
export const SUBMISSION_MAX_PICTURE_SIZE_LABEL = '5 Mo';

const deliveryYearRangeMessage = `L'année de livraison doit être entre ${SUBMISSION_DELIVERY_YEAR_MIN} et ${SUBMISSION_DELIVERY_YEAR_MAX}`;

const baseSubmissionSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis'),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(
			SUBMISSION_DESCRIPTION_MAX_LENGTH,
			`La description ne doit pas dépasser ${SUBMISSION_DESCRIPTION_MAX_LENGTH} caractères`,
		),
	address: z.string().min(1, "L'adresse est requise"),
	contributorEmail: z.string().email('Adresse email invalide'),
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
	name: z.string().min(1),
	type: z.string().regex(/^image\//, 'Seules les images sont acceptées'),
	size: z.number().int().positive().max(SUBMISSION_MAX_PICTURE_SIZE_BYTES),
	base64: z.string().min(1),
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
			city: z.string().optional(),
			postcode: z.string().optional(),
			department: z.string().optional(),
			region: z.string().optional(),
			citycode: z.string().optional(),
		})
		.optional(),
	pictures: picturesArrayOf(wirePictureSchema),
});

export type ClientSubmission = z.infer<typeof clientSubmissionSchema>;
export type WireSubmission = z.infer<typeof wireSubmissionSchema>;
export type WireSubmissionPicture = z.infer<typeof wirePictureSchema>;
