import { getRequestUrl } from '@tanstack/react-start/server';

// A Report can be published outside a website request (script, job): no request URL then.
export function siteOrigin(): string {
	try {
		return getRequestUrl({ xForwardedHost: true, xForwardedProto: true })
			.origin;
	} catch {
		if (process.env.SITE_URL) return new URL(process.env.SITE_URL).origin;
		throw new Error('No request and no SITE_URL to build an absolute link');
	}
}
