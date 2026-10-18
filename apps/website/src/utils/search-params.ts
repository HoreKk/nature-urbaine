import { payloadParseSearch } from '@payloadcms/tanstack-start/shared';

// Before Payload 4, TanStack Router's default serializer wrote search params
// as JSON: `?category=[1,2]`, or `?search="2024"` for a string that reads as
// a number. Shared and bookmarked links still carry that form, and Payload's
// qs parser hands it to `validateSearch` as a raw string, which fails.
const LEGACY_JSON = /^(?:\[.*\]|\{.*\}|".*")$/s;

function decodeLegacyValue(value: unknown): unknown {
	if (typeof value !== 'string' || !LEGACY_JSON.test(value)) return value;
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

/**
 * Payload's qs `parseSearch` (the admin needs its nested `where` filters),
 * plus decoding of top-level values written by the pre-v4 JSON serializer.
 * Nested qs values are left alone, so admin filters are unaffected.
 */
export function parseSearch(searchStr: string): Record<string, unknown> {
	const parsed = payloadParseSearch(searchStr);
	return Object.fromEntries(
		Object.entries(parsed).map(([key, value]) => [
			key,
			decodeLegacyValue(value),
		]),
	);
}
