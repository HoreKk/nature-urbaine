import { createServerFn } from '@tanstack/react-start';
import { contributionAdminURL } from '@/payload/utilities/contribution-admin-url';
import { inspectContributionArchive } from './contribution-archive';
import {
	ARCHIVE_MISSING,
	prepareContributionUploadSchema,
	submitContributionSchema,
} from './contribution-contract';
import {
	claimStagingUpload,
	deleteStagingUpload,
	presignStagingUpload,
	readStagingUpload,
	sweepStaleStagingUploads,
} from './contribution-uploads';
import { baseProcedure } from './db';
import { sendContributionNotificationEmail } from './emails/contribution';
import { guardFormSubmission } from './form-guard';
import { siteOrigin } from './site-origin';

/** First step: the browser PUTs the zip to the returned URL, then calls `submitContribution`. */
export const prepareContributionUpload = createServerFn({ method: 'POST' })
	.validator(prepareContributionUploadSchema)
	.handler(async ({ data }) => {
		// Bots get a success that leads nowhere, like on the other forms.
		if (!guardFormSubmission('contribution', data)) return { upload: null };

		sweepStaleStagingUploads().catch((error) => {
			console.error('Contribution staging sweep failed', { error });
		});

		return { upload: await presignStagingUpload(data.archiveSize) };
	});

export const submitContribution = createServerFn({ method: 'POST' })
	.validator(submitContributionSchema)
	.middleware([baseProcedure])
	.handler(async ({ data, context }) => {
		const { db } = context;
		const {
			uploadKey,
			consent: _consent,
			category,
			location,
			photosTakenAt,
			projectOwner,
			projectManagement,
			deliveryYear,
			projectCost,
			projectArea,
			...fields
		} = data;
		const projectDetails = {
			projectOwner,
			projectManagement,
			deliveryYear,
			projectCost,
			projectArea,
		};

		try {
			if (!claimStagingUpload(uploadKey)) throw new Error(ARCHIVE_MISSING);
			const bytes = await readStagingUpload(uploadKey);
			if (!bytes) throw new Error(ARCHIVE_MISSING);
			const { pictureCount } = inspectContributionArchive(bytes);

			// Trusted server-side writes for an anonymous visitor: both collections
			// refuse `create` to everyone else.
			const archive = await db.create({
				overrideAccess: true,
				collection: 'contribution-archives',
				data: {},
				file: {
					name: archiveFilename(fields.title),
					mimetype: 'application/zip',
					size: bytes.length,
					data: Buffer.from(bytes),
				},
			});

			try {
				const contribution = await db.create({
					overrideAccess: true,
					collection: 'contributions',
					data: {
						...fields,
						category,
						projectDetails,
						locationDetails: location,
						photosTakenAt,
						archive: archive.id,
						status: 'pending',
						consentedAt: new Date().toISOString(),
					},
					depth: 1,
				});

				sendContributionNotificationEmail({
					...fields,
					...projectDetails,
					category:
						typeof contribution.category === 'object'
							? contribution.category.name
							: String(contribution.category),
					address: location.address,
					pictureCount,
					adminUrl: contributionAdminURL(db, contribution.id, siteOrigin()),
				}).catch((error) => {
					console.error('Contribution email sending failed', {
						error,
						contributionId: contribution.id,
					});
				});

				return { id: contribution.id };
			} catch (error) {
				await db.delete({
					overrideAccess: true,
					collection: 'contribution-archives',
					id: archive.id,
				});
				throw error;
			}
		} finally {
			await deleteStagingUpload(uploadKey).catch((error) => {
				console.error('Contribution staging cleanup failed', { error });
			});
		}
	});

/** Readable when the operator downloads it: `2026-10-25-paris-rue-de-la-paix.zip`. */
function archiveFilename(title: string): string {
	const slug = title
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 60);
	const day = new Date().toISOString().slice(0, 10);
	return `${day}-${slug || 'contribution'}.zip`;
}
