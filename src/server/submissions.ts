import { createServerFn } from '@tanstack/react-start';
import { baseProcedure } from './db';
import { sendSubmissionEmail } from './emails/submission';
import { guardFormSubmission } from './form-guard';
import {
	SUBMISSION_MAX_PICTURE_SIZE_BYTES,
	wireSubmissionSchema,
} from './submission-contract';

export const createSubmission = createServerFn({ method: 'POST' })
	.validator(wireSubmissionSchema)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { db } = context;

		if (!guardFormSubmission('submission', data)) {
			return { id: 0 };
		}

		// Trusted server-side writes for an anonymous visitor: creating `media` and
		// cleaning up after a failure need no user, so these calls bypass access.
		const uploadedPictures = await Promise.all(
			data.pictures.map(async (picture, index) => {
				const buffer = Buffer.from(picture.base64, 'base64');
				// The declared size comes from the browser; measure the real bytes.
				if (buffer.length > SUBMISSION_MAX_PICTURE_SIZE_BYTES) {
					throw new Error('PICTURE_TOO_LARGE');
				}

				const { id } = await db.create({
					overrideAccess: true,
					collection: 'media',
					data: { alt: `${data.name} - image ${index + 1}` },
					file: {
						name: picture.name,
						mimetype: picture.type,
						size: buffer.length,
						data: buffer,
					},
				});

				return id;
			}),
		);

		try {
			const [{ id: submissionId }, categoryDoc] = await Promise.all([
				db.create({
					overrideAccess: true,
					collection: 'submissions',
					data: {
						...data,
						locationDetails: data.locationDetails ?? {},
						pictures: uploadedPictures,
						status: 'pending',
					},
				}),
				db.findByID({
					overrideAccess: true,
					collection: 'categories',
					id: data.category,
				}),
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
					db.delete({
						overrideAccess: true,
						collection: 'media',
						id: pictureId,
					}),
				),
			);

			throw error;
		}
	});
