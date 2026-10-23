import { z } from 'zod';

/** Anti-abuse fields every public form sends next to its own values. */
export const formGuardFields = {
	/** Time spent on the form, measured by the browser so clock skew is moot. */
	fillMs: z.number().int().nonnegative(),
};

export const RATE_LIMITED = 'RATE_LIMITED';

export function submitErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message === RATE_LIMITED) {
		return 'Trop d’envois depuis votre connexion. Veuillez réessayer dans une heure.';
	}
	return 'Une erreur est survenue. Veuillez réessayer.';
}
