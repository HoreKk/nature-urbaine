import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { withPayload } from '@payloadcms/tanstack-start';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import { nitro } from 'nitro/vite';
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
			// AWS SDK (bundled by Payload for storage-s3) pulls in `tslib`; bundling
			// its UMD build loses the `default` export under Rolldown's CJS interop.
			// Keep it external so Nitro traces the real package instead.
			environments: {
				rsc: { build: { rollupOptions: { external: ['tslib'] } } },
				ssr: { build: { rollupOptions: { external: ['tslib'] } } },
			},
			plugins: [
				rsc(pluginOptions.rsc),
				tanstackStart(pluginOptions.tanstackStart),
				viteReact(pluginOptions.react),
				nitro({
					...pluginOptions.nitro,
					compressPublicAssets: { gzip: true, brotli: true },
				}),
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
