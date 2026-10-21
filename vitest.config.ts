import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

// Kept apart from vite.config.ts: the TanStack Start and Nitro plugins load a
// second React copy under Vitest, which breaks any test rendering hooks.
export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
