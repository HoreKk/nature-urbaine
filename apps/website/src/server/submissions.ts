import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { baseProcedure } from './db';

const maxSubmissionPictures = 5;
const maxSubmissionPictureSize = 5 * 1024 * 1024;

const submissionPictureSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number().int().positive().max(maxSubmissionPictureSize),
	base64: z.string().min(1),
});

const createSubmissionSchema = z.object({
	name: z.string().min(1, 'Le titre du projet est requis'),
	description: z
		.string()
		.min(1, 'La description est requise')
		.max(500, 'La description ne doit pas dépasser 500 caractères'),
	category: z.coerce.number().int().min(1, 'La catégorie est requise'),
	deliveryYear: z.coerce.number().int().min(1900).max(2100),
	address: z.string().min(1, "L'adresse est requise"),
	locationDetails: z
		.object({
			city: z.string().optional(),
			postcode: z.string().optional(),
			department: z.string().optional(),
			region: z.string().optional(),
			citycode: z.string().optional(),
		})
		.optional(),
	pictures: z
		.array(submissionPictureSchema)
		.min(1, 'Ajoutez au moins une image')
		.max(maxSubmissionPictures, 'Vous pouvez ajouter au maximum 5 images'),
	contributorEmail: z.string().email('Adresse email invalide'),
	honeypot: z.string().optional(),
});

export const createSubmission = createServerFn({ method: 'POST' })
	.inputValidator(createSubmissionSchema)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		if (data.honeypot) {
			return { id: 0 };
		}

		for (const picture of data.pictures) {
			if (!picture.type.startsWith('image/')) {
				throw new Error('Seules les images sont acceptees.');
			}
		}

		const uploadedPictures = await Promise.all(
			data.pictures.map(async (picture, index) => {
				const buffer = Buffer.from(picture.base64, 'base64');

				const uploaded = await context.db.create({
					collection: 'media',
					data: {
						alt: `${data.name} - image ${index + 1}`,
					},
					file: {
						name: picture.name,
						mimetype: picture.type,
						size: picture.size,
						data: buffer,
					},
				});

				return uploaded.id;
			}),
		);

		try {
			const submission = await context.db.create({
				collection: 'submissions',
				data: {
					name: data.name,
					description: data.description,
					category: data.category,
					deliveryYear: data.deliveryYear,
					address: data.address,
					locationDetails: data.locationDetails ?? {},
					contributorEmail: data.contributorEmail,
					pictures: uploadedPictures,
					status: 'pending',
				},
			});

			return { id: submission.id };
		} catch (error) {
			await Promise.all(
				uploadedPictures.map((pictureId) =>
					context.db.delete({
						collection: 'media',
						id: pictureId,
					}),
				),
			);

			throw error;
		}
	});
