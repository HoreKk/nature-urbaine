import { fileURLToPath, URL } from 'node:url';
import { devtools } from '@tanstack/devtools-vite';
import { nitro } from 'nitro/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		devtools(),
		nitro(),
		tanstackStart(),
		viteReact(),
	],
	optimizeDeps: {
		exclude: ['payload'],
	},
});

export default config;
