interface UmamiPayload {
	url?: string;
	[field: string]: unknown;
}

declare global {
	interface Window {
		umamiBeforeSend?: typeof umamiBeforeSend;
	}
}

/**
 * `data-before-send` hook: the tracker follows in-app navigation, so a move
 * from the site into the admin without a reload would still be sent.
 */
export function umamiBeforeSend<T extends UmamiPayload>(
	_type: string,
	payload: T,
): T | false {
	if (!payload.url) return payload;
	const { pathname } = new URL(payload.url, 'http://localhost');
	return /^\/admin(\/|$)/.test(pathname) ? false : payload;
}
