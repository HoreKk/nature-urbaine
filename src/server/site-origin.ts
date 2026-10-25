import { getRequestUrl } from '@tanstack/react-start/server';

// A Report can be published outside a website request (script, job): no request URL then.
export function siteOrigin(): string {
	try {
		return getRequestUrl({ xForwardedHost: true, xForwardedProto: true })
			.origin;
	} catch {
		const domain = process.env.WEBSITE_DOMAIN;
		if (domain) return `https://${domain}`;
		throw new Error(
			'No request and no WEBSITE_DOMAIN to build an absolute link',
		);
	}
}
