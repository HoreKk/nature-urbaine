interface RateLimitOptions {
	limit: number;
	windowMs: number;
}

/**
 * Fixed-window counter in memory: enough while the site runs on one Railway
 * instance. Counts reset on every deploy.
 */
export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
	const windows = new Map<string, { count: number; resetAt: number }>();

	return {
		/** Counts a hit for `key`; false once `key` is over the limit. */
		consume(key: string, now = Date.now()): boolean {
			const current = windows.get(key);

			if (!current || current.resetAt <= now) {
				// Visitors who never come back would otherwise stay in the map forever.
				if (windows.size > 10_000) {
					for (const [staleKey, { resetAt }] of windows) {
						if (resetAt <= now) windows.delete(staleKey);
					}
				}
				windows.set(key, { count: 1, resetAt: now + windowMs });
				return true;
			}

			current.count += 1;
			return current.count <= limit;
		},
	};
}
