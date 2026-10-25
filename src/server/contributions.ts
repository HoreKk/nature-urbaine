import { createServerFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
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
import { sendContributionEmail } from './emails/contribution';
import { guardFormSubmission } from './form-guard';

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

		try {
			if (!claimStagingUpload(data.uploadKey)) throw new Error(ARCHIVE_MISSING);
			const bytes = await readStagingUpload(data.uploadKey);
			if (!bytes) throw new Error(ARCHIVE_MISSING);
			const { pictureCount } = inspectContributionArchive(bytes);

			// Trusted server-side writes for an anonymous visitor: both collections
			// refuse `create` to everyone else.
			const archive = await db.create({
				overrideAccess: true,
				collection: 'contribution-archives',
				data: {},
				file: {
					name: archiveFilename(data.title),
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
						title: data.title,
						description: data.description || undefined,
						category: data.category,
						projectDetails: {
							projectOwner: data.projectOwner || undefined,
							projectManagement: data.projectManagement || undefined,
							deliveryYear: data.deliveryYear,
							projectCost: data.projectCost || undefined,
							projectArea: data.projectArea || undefined,
						},
						locationDetails: data.location,
						photosTakenAt: data.photosTakenAt,
						authorName: data.authorName,
						authorEmail: data.authorEmail,
						archive: archive.id,
						status: 'pending',
						consentedAt: new Date().toISOString(),
					},
					depth: 1,
				});

				const category = contribution.category;
				sendContributionEmail({
					title: data.title,
					category:
						typeof category === 'object' ? category.name : String(category),
					description: data.description || undefined,
					projectOwner: data.projectOwner || undefined,
					projectManagement: data.projectManagement || undefined,
					deliveryYear: data.deliveryYear,
					projectCost: data.projectCost || undefined,
					projectArea: data.projectArea || undefined,
					address: data.location.address || undefined,
					authorName: data.authorName,
					authorEmail: data.authorEmail,
					pictureCount,
					adminUrl: `${getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin}/admin/collections/contributions/${contribution.id}`,
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
			await deleteStagingUpload(data.uploadKey).catch((error) => {
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
