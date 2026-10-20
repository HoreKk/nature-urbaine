import { payloadParseSearch } from '@payloadcms/tanstack-start/shared';

// Pre-v4 links still carry TanStack's JSON form (`?category=[1,2]`, `?search="2024"`),
// which Payload's qs parser hands to `validateSearch` as a raw string.
const LEGACY_JSON = /^(?:\[.*\]|\{.*\}|".*")$/s;

function decodeLegacyValue(value: unknown): unknown {
	if (typeof value !== 'string' || !LEGACY_JSON.test(value)) return value;
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

/** Decodes only top-level values: nested qs values are the admin's `where` filters. */
export function parseSearch(searchStr: string): Record<string, unknown> {
	const parsed = payloadParseSearch(searchStr);
	return Object.fromEntries(
		Object.entries(parsed).map(([key, value]) => [
			key,
			decodeLegacyValue(value),
		]),
	);
}
