import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { withPayload } from '@payloadcms/tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
	withPayload(
		({ pluginOptions }) => ({
			resolve: {
				alias: {
					'@': fileURLToPath(new URL('./src', import.meta.url)),
				},
			},
			plugins: [
				rsc(pluginOptions.rsc),
				tanstackStart(pluginOptions.tanstackStart),
				viteReact(pluginOptions.react),
			],
		}),
		{
			payloadConfigPath: path.resolve(dirname, 'src', 'payload.config.ts'),
			// `file-type` lazy-imports its parsers at request time; through Vite's
			// module runner that breaks once the runner is recycled (dep
			// re-optimisation), and Payload's file route then 500s.
			devServerExternalPackages: ['file-type'],
		},
	),
);
