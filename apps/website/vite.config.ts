import { fileURLToPath, URL } from 'node:url';
import { devtools } from '@tanstack/devtools-vite';
// import { nitro as nitroV3Plugin } from 'nitro/vite';
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	plugins: [
		devtools(),
		// nitroV3Plugin(),
		nitroV2Plugin(),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tanstackStart(),
		viteReact(),
	],
	optimizeDeps: {
		exclude: ['payload'],
	},
});

export default config;
