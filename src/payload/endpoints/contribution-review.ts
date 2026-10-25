import {
	addDataAndFileToRequest,
	commitTransaction,
	type Endpoint,
	initTransaction,
	killTransaction,
	type PayloadHandler,
	type PayloadRequest,
} from 'payload';
import { z } from 'zod';
import { CONTRIBUTION_REJECTION_NOTE_MAX_LENGTH } from '../../server/contribution-contract';
import type { Contribution } from '../payload-types';
import { lockContribution } from '../utilities/transaction';

/** Its message is shown to the operator as is. */
class ReviewError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

const idOf = (value: number | { id: number } | null | undefined) =>
	typeof value === 'object' ? value?.id : value;

async function inTransaction<T>(
	req: PayloadRequest,
	run: () => Promise<T>,
): Promise<T> {
	const shouldCommit = await initTransaction(req);
	try {
		const result = await run();
		if (shouldCommit) await commitTransaction(req);
		return result;
	} catch (error) {
		if (shouldCommit) await killTransaction(req);
		throw error;
	}
}

async function findContribution(
	req: PayloadRequest,
	allowed: Contribution['status'][],
): Promise<Contribution> {
	const id = Number(req.routeParams?.id);
	if (!Number.isInteger(id)) {
		throw new ReviewError(404, 'Contribution introuvable.');
	}
	await lockContribution(req, id);
	const contribution = await req.payload.findByID({
		collection: 'contributions',
		id,
		depth: 0,
		disableErrors: true,
		req,
	});
	if (!contribution) {
		throw new ReviewError(404, 'Contribution introuvable.');
	}
	if (!allowed.includes(contribution.status)) {
		throw new ReviewError(409, 'Cette contribution a déjà été traitée.');
	}
	return contribution;
}

/** Valider: a draft Report holding the Contribution's fields, for the operator to finish. */
async function accept(req: PayloadRequest): Promise<Response> {
	const report = await inTransaction(req, async () => {
		const contribution = await findContribution(req, ['pending']);
		const category = idOf(contribution.category);
		if (category == null) {
			throw new ReviewError(409, 'Choisissez une catégorie avant de valider.');
		}

		const created = await req.payload.create({
			collection: 'reports',
			draft: true,
			depth: 0,
			req,
			data: {
				_status: 'draft',
				projectName: contribution.title,
				description: contribution.description ?? '',
				category,
				date: contribution.photosTakenAt ?? contribution.createdAt,
				locationDetails: contribution.locationDetails,
				projectDetails: {
					...contribution.projectDetails,
					photoAuthor: contribution.authorName,
				},
			},
		});

		await req.payload.update({
			collection: 'contributions',
			id: contribution.id,
			depth: 0,
			req,
			data: { status: 'accepted', report: created.id },
		});

		return created;
	});

	return Response.json({ report: report.id });
}

async function wasEverPublished(req: PayloadRequest, report: number) {
	const { totalDocs } = await req.payload.countVersions({
		collection: 'reports',
		where: {
			parent: { equals: report },
			'version._status': { equals: 'published' },
		},
		req,
	});
	return totalDocs > 0;
}

const rejectBodySchema = z.object({
	note: z.string().trim().min(1).max(CONTRIBUTION_REJECTION_NOTE_MAX_LENGTH),
});

/**
 * Refuser: keeps the row and the note for audit, drops the photos, and the
 * draft Report with any photo the operator already added to it.
 */
async function reject(req: PayloadRequest): Promise<Response> {
	await addDataAndFileToRequest(req);
	const body = rejectBodySchema.safeParse(req.data);
	if (!body.success) {
		throw new ReviewError(400, 'Indiquez le motif du refus.');
	}
	const { note } = body.data;

	const rejected = await inTransaction(req, async () => {
		const contribution = await findContribution(req, ['pending', 'accepted']);
		const report = idOf(contribution.report);
		const archive = idOf(contribution.archive);

		if (report != null && (await wasEverPublished(req, report))) {
			throw new ReviewError(
				409,
				'Le reportage a déjà été publié : la contribution ne peut plus être refusée.',
			);
		}

		await req.payload.update({
			collection: 'contributions',
			id: contribution.id,
			depth: 0,
			req,
			data: {
				status: 'rejected',
				rejectionNote: note,
				archive: null,
				report: null,
			},
		});

		if (report != null) {
			await req.payload.delete({
				collection: 'pictures',
				where: { report: { equals: report } },
				req,
			});
			await req.payload.delete({ collection: 'reports', id: report, req });
		}
		if (archive != null) {
			await req.payload.delete({
				collection: 'contribution-archives',
				id: archive,
				req,
			});
		}

		return contribution;
	});

	// Imported here: the email module loads the Payload config, which loads this file.
	const { sendContributionRejectedEmail } =
		await import('../../server/emails/contribution');
	try {
		await sendContributionRejectedEmail({
			title: rejected.title,
			authorName: rejected.authorName,
			authorEmail: rejected.authorEmail,
			rejectionNote: note,
		});
		return Response.json({ emailSent: true });
	} catch (error) {
		// The refusal stands: the note stays on the Contribution for a manual reply.
		req.payload.logger.error(
			{ err: error },
			'Contribution rejection email failed',
		);
		return Response.json({ emailSent: false });
	}
}

const reviewHandler =
	(run: (req: PayloadRequest) => Promise<Response>): PayloadHandler =>
	async (req) => {
		if (!req.user) {
			return Response.json({ message: 'Connexion requise.' }, { status: 401 });
		}
		try {
			return await run(req);
		} catch (error) {
			if (error instanceof ReviewError) {
				return Response.json(
					{ message: error.message },
					{ status: error.status },
				);
			}
			throw error;
		}
	};

/** The only ways a Contribution leaves `pending` (ADR-0005). */
export const contributionReviewEndpoints: Endpoint[] = [
	{ path: '/:id/accept', method: 'post', handler: reviewHandler(accept) },
	{ path: '/:id/reject', method: 'post', handler: reviewHandler(reject) },
];
