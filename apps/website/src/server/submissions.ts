import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { baseProcedure } from './db';

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
				status: 'pending',
			},
		});

		return { id: submission.id };
	});
