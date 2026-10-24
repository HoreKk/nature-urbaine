import {
	getRequestHeader,
	getRequestIP,
	setResponseStatus,
} from '@tanstack/react-start/server';
import { RATE_LIMITED } from './form-guard-contract';
import { createRateLimiter } from './rate-limit';

const HOUR_MS = 60 * 60 * 1000;
const MIN_FILL_MS = 3000;

const limiters = {
	contact: createRateLimiter({ limit: 5, windowMs: HOUR_MS }),
	contribution: createRateLimiter({ limit: 3, windowMs: HOUR_MS }),
};

interface GuardInput {
	honeypot?: string;
	fillMs: number;
}

/**
 * False for bot-looking submissions: the caller answers with a fake success so
 * the bot learns nothing. Throws when the visitor is over the rate limit.
 */
export function guardFormSubmission(
	form: keyof typeof limiters,
	{ honeypot, fillMs }: GuardInput,
): boolean {
	if (honeypot || fillMs < MIN_FILL_MS) return false;

	if (!limiters[form].consume(getClientIp() ?? 'unknown')) {
		setResponseStatus(429);
		throw new Error(RATE_LIMITED);
	}

	return true;
}

function getClientIp(): string | undefined {
	// Railway's edge sets X-Real-IP; the first X-Forwarded-For hop is client-forgeable.
	return getRequestHeader('x-real-ip') ?? getRequestIP();
}
