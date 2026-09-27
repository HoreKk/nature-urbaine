import { fileURLToPath, URL } from 'node:url';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		// Pre-compress JS/CSS/fonts at build time; Railway's proxy does not
		// compress for us and service egress is billed.
		nitro({ compressPublicAssets: { gzip: true, brotli: true } }),
		tanstackStart(),
		viteReact(),
	],
	optimizeDeps: {
		exclude: ['payload'],
	},
});

export default config;
