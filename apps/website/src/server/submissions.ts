import { createServerFn } from '@tanstack/react-start';
import { baseProcedure } from './db';
import { sendSubmissionEmail } from './emails/submission';
import { wireSubmissionSchema } from './submission-contract';

export const createSubmission = createServerFn({ method: 'POST' })
	.inputValidator(wireSubmissionSchema)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { db } = context;

		if (data.honeypot) {
			return { id: 0 };
		}

		const uploadedPictures = await Promise.all(
			data.pictures.map(async (picture, index) => {
				const buffer = Buffer.from(picture.base64, 'base64');

				const { id } = await db.create({
					collection: 'media',
					data: { alt: `${data.name} - image ${index + 1}` },
					file: {
						name: picture.name,
						mimetype: picture.type,
						size: picture.size,
						data: buffer,
					},
				});

				return id;
			}),
		);

		try {
			const [{ id: submissionId }, categoryDoc] = await Promise.all([
				db.create({
					collection: 'submissions',
					data: {
						...data,
						locationDetails: data.locationDetails ?? {},
						pictures: uploadedPictures,
						status: 'pending',
					},
				}),
				db.findByID({ collection: 'categories', id: data.category }),
			]);

			const categoryLabel =
				typeof categoryDoc === 'object' &&
				categoryDoc !== null &&
				'name' in categoryDoc
					? String(categoryDoc.name)
					: String(data.category);

			sendSubmissionEmail({
				...data,
				category: categoryLabel,
			}).catch((error) => {
				console.error('Submission email sending failed', {
					error,
					submissionId,
				});
			});

			return { id: submissionId };
		} catch (error) {
			await Promise.all(
				uploadedPictures.map((pictureId) =>
					db.delete({ collection: 'media', id: pictureId }),
				),
			);

			throw error;
		}
	});
