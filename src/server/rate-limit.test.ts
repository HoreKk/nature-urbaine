import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
	it('allows hits up to the limit, then blocks', () => {
		const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });

		expect(limiter.consume('ip', 0)).toBe(true);
		expect(limiter.consume('ip', 10)).toBe(true);
		expect(limiter.consume('ip', 20)).toBe(false);
	});

	it('counts each key separately', () => {
		const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

		expect(limiter.consume('a', 0)).toBe(true);
		expect(limiter.consume('b', 0)).toBe(true);
		expect(limiter.consume('a', 0)).toBe(false);
	});

	it('starts a new window once the previous one ends', () => {
		const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });

		expect(limiter.consume('ip', 0)).toBe(true);
		expect(limiter.consume('ip', 500)).toBe(false);
		expect(limiter.consume('ip', 1000)).toBe(true);
	});
});
