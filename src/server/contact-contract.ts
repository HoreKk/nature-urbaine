import { z } from 'zod';
import { formGuardFields } from './form-guard-contract';

export const CONTACT_MESSAGE_MAX_LENGTH = 5000;

export const clientContactSchema = z.object({
	firstName: z.string().min(1, 'Le prénom est requis').max(100),
	lastName: z.string().min(1, 'Le nom est requis').max(100),
	email: z.email('Adresse email invalide').max(254),
	sector: z.string().min(1, "Le secteur d'activité est requis").max(200),
	message: z
		.string()
		.min(1, 'Le message est requis')
		.max(
			CONTACT_MESSAGE_MAX_LENGTH,
			`Le message ne doit pas dépasser ${CONTACT_MESSAGE_MAX_LENGTH} caractères`,
		),
	honeypot: z.string().optional(),
});

export const wireContactSchema = clientContactSchema.extend(formGuardFields);
