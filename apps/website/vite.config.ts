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
			// Bundling `tslib`'s UMD build (pulled in by the AWS SDK) loses its `default`
			// export under Rolldown's CJS interop; external lets Nitro trace the real package.
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
					// `file-type` loads `strtok3` through a runtime-built import that
					// static tracing can't see; Payload's file route needs it.
					traceDeps: [...(pluginOptions.nitro.traceDeps ?? []), 'strtok3*'],
					compressPublicAssets: { gzip: true, brotli: true },
				}),
			],
		}),
		{
			payloadConfigPath: path.resolve(dirname, 'src', 'payload.config.ts'),
			// `file-type` lazy-imports its parsers; once Vite's module runner is recycled
			// (dep re-optimisation) that breaks and Payload's file route 500s.
			devServerExternalPackages: ['file-type'],
		},
	),
);
