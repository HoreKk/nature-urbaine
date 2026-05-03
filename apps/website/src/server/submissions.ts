import { createServerFn } from '@tanstack/react-start';
import { baseProcedure } from './db';
import { wireSubmissionSchema } from './submission-contract';

export const createSubmission = createServerFn({ method: 'POST' })
	.inputValidator(wireSubmissionSchema)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		if (data.honeypot) {
			return { id: 0 };
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
