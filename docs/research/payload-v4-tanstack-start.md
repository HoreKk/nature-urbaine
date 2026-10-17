# Payload v4 + TanStack Start: should we merge `apps/cms-payload` into `apps/website`?

Research note, 2026-10-17. Context: the branch `chore/payload-3.90.2` bumps Payload to 3.91.0. The question is whether Payload v4's TanStack Start adapter can replace the separate Next.js CMS service on Railway, and whether that removes presigned media URLs and lowers memory.

This is the first research note in the repo. No research or notes convention existed, so `docs/research/` was created for it.

Legend: **[fact]** is verified against a primary source cited inline. **[announced]** is stated by Payload or TanStack but not shipped as stable. **[inference]** and **[estimate]** are my own reasoning and are not verified.

---

## TL;DR

- **Payload v4 is in public beta.** On npm, `beta` is `4.0.0-beta.2` (2026-10-16) and `latest` is still `3.91.0` (2026-10-15). No stable date has been announced.
- **The TanStack Start adapter has shipped in the beta.** It is the package `@payloadcms/tanstack-start@4.0.0-beta.2`. It runs the admin UI, the REST/GraphQL API (`api.$.ts`) and the server functions inside TanStack Start, through `@vitejs/plugin-rsc` and Vite 8. It does not exist for 3.x.
- **Merging into one app would not remove presigned URLs.** We presign because Railway buckets are private, not because the CMS is on a different origin (ADR-0003). In practice the website already signs media itself and does not call the CMS at runtime.
- **The website already runs a full Payload instance in-process** (Local API through `getPayload`). Today we pay for two Node processes that each boot Payload. Merging saves roughly the CMS service's RSS minus whatever the admin routes add. That is an [estimate]: measure per-service memory on Railway first.
- **Recommendation: stay on 3.91 now.** Lowest-effort memory win right away: enable Railway Serverless (sleeping) on the CMS service, since only editors use it. Run a v4 spike branch, and migrate when the trigger criteria in §6 are met (v4 stable plus the first patch release, among others).
- **v4 traps for this repo:** `overrideAccess` now defaults to `false`, and most of our collections have no `access.read`. Image `sizes` becomes `variants` and sharp becomes optional, which touches ADR-0003. Versions and authorship are on by default, so a schema migration is needed. Node 24.15+ is required.

- **Spike (§7):**
  - One TanStack Start app without Next.js runs the site, `/admin` and `/api` on v4 beta.2. It works in dev and in a production build, on a DB copy, after migrations.
  - At peak it used ~27% less memory than today's two services (432 MB vs 590 MB, macOS footprint, same load).
  - Nitro had to go (it breaks Chakra SSR in the build), and the codemod missed most of our `overrideAccess` call sites.
  - A quick win that doesn't need v4: start the Railway services with `node`, not through `pnpm`, which saves ~56 MB per wrapper process.

---

## 0. Current repo setup (facts from the repo)

- **Two apps on Railway.**
  - `apps/website` is TanStack Start on Vite 8 with Nitro (`apps/website/package.json`, `apps/website/vite.config.ts`).
  - `apps/cms-payload` is Next 16 with `@payloadcms/next` 3.91.0 (`apps/cms-payload/package.json`).
  - There is no `railway.json`, Dockerfile or nixpacks file in the repo. Builds use Railway defaults on the root scripts `serve:web` and `serve:admin` (`package.json`).
- **Shared config.** `packages/database/src/config.ts` builds a single Payload config.
  - Admin is mounted at `/` (`config.ts:83-85`).
  - It uses Postgres, Lexical, Nodemailer, the `fr` translations and sharp.
  - Storage comes from `storagePlugin()` (`config.ts:131`).
- **The website already embeds Payload.**
  - `apps/website/src/server/db.ts` calls `getPayload({ config: payloadConfig })` in a TanStack Start middleware.
  - `payloadConfig` is `buildPayloadConfig({ push: false })` (`packages/database/src/read-config.ts:9`).
  - So the website process already boots the full Payload config, including the Postgres pool, sharp and the S3 plugin. The CMS process does the same.
- **Storage.**
  - `@payloadcms/storage-s3` with `signedDownloads: true` per collection (`packages/database/src/storage.ts:73-80`).
  - Railway buckets are private.
  - The website rewrites `/api/(pictures|media)/file/...` into day-stable presigned URLs (`apps/website/src/server/media-urls.ts:5-27`, ADR-0003).
  - It only falls back to the CMS through `BACKEND_URL` when the `S3_*` variables are missing (`media-urls.ts:141`).
- **Plugins and adapters in use.** All are first-party; there are no third-party Payload plugins.
  - `@payloadcms/db-postgres`
  - `@payloadcms/richtext-lexical`
  - `@payloadcms/storage-s3`, which depends on `plugin-cloud-storage`
  - `@payloadcms/email-nodemailer`
  - `@payloadcms/translations`
  - `@payloadcms/next`
  - `@payloadcms/ui`

  Sources: `packages/database/package.json`, `apps/cms-payload/package.json`.

- **Collection access rules.**
  - Only `Media`, `Picture` and `Submission` declare `access` (for example `Picture.ts:9-10` `read: () => true`).
  - `Report`, `Interview`, `Category`, `Tag`, `TagCategory` and `Users` have none. This matters for v4, see §1.

---

## 1. What Payload v4 is

**[fact] Release status**

| Item             | Value                                                                | Source                                                           |
| ---------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| npm `latest`     | `3.91.0` (published 2026-10-15)                                      | `npm view payload dist-tags` / `time`                            |
| npm `beta`       | `4.0.0-beta.2` (2026-10-16)                                          | same                                                             |
| npm `canary`     | `4.0.0-canary.39`                                                    | same                                                             |
| First beta       | `v4.0.0-beta.0`, 2026-10-09                                          | https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.0 |
| Beta docs banner | The beta docs warn they "may be incomplete or change before release" | https://payloadcms.com/docs/beta/getting-started/what-is-payload |

**[fact] Headline features in the beta.0 release notes**

- Admin UI redesign
- TanStack support
- Dashboard components
- Accessibility
- Hierarchies
- Tags
- Grid view
- Improved file uploads UI and file upload versions
- Rewritten MCP
- Codemods

Upgrade commands: `npx @payloadcms/codemod@beta upgrade` (agent-assisted) or `npx @payloadcms/codemod@beta`. Source: https://github.com/payloadcms/payload/releases/tag/v4.0.0-beta.0

**[announced] Timeline**

- The 2026-06-09 blog post targeted a beta "within the next quarter" and "a shorter path from beta to stable" than 3.0 had. It gives no stable date. Source: https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more
- A community question about the stable timeline (https://github.com/payloadcms/payload/discussions/18614) has no maintainer answer yet. The only reply is from a non-member.

**[fact] Migration guide.** Source: https://payloadcms.com/docs/beta/migration-guide/v4. Breaking changes relevant to us:

| Change                                                                                                                                                                | Impact on this repo                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node ≥ 24.15.0, Next ≥ 16.4.0, TypeScript ≥ 6.0.3                                                                                                                     | The CMS uses TS ^5.8 and Next ^16.3. Railway's Node version must be pinned.                                                                                                                                                                                                                                                                                                    |
| **`overrideAccess` defaults to `false` on Local API calls**                                                                                                           | **High risk.** Website server functions read `reports`, `interviews`, `categories` and `tags`, which have no `access.read`. Payload's default read access requires a logged-in user, so those reads would be refused. Every website call needs `overrideAccess: true`, or the collections need explicit public `read`. The codemod cannot fix spread or non-literal arguments. |
| `defaultDepth` is now 1 (was 2)                                                                                                                                       | Website queries that rely on depth-2 population will change shape.                                                                                                                                                                                                                                                                                                             |
| Versions and authorship are on by default                                                                                                                             | New `_<slug>_versions` tables and `createdBy`/`updatedBy` columns. A migration is needed, or opt out with `versions: false`.                                                                                                                                                                                                                                                   |
| Storage adapters move to a top-level `storage` key; `alwaysInsertFields` is removed; prefixes are always included                                                     | `packages/database/src/storage.ts` must be rewritten.                                                                                                                                                                                                                                                                                                                          |
| Sharp becomes optional (`@payloadcms/transformer-sharp`); `imageSizes` becomes `variants`; `sizes` data becomes `variants` (predefined `sizes-to-variants` migration) | **Touches ADR-0003.** `media-urls.ts` rewrites `sizes`, and `utils/picture-src.ts` picks `sizes.thumbnail`.                                                                                                                                                                                                                                                                    |
| Uploads keep originals and file history (`original`, `_objectKey`)                                                                                                    | DB migration.                                                                                                                                                                                                                                                                                                                                                                  |
| `upload.abortOnLimit` now defaults to `true` (HTTP 413)                                                                                                               | Check submission uploads.                                                                                                                                                                                                                                                                                                                                                      |
| Nodemailer adapter moves to nodemailer 10                                                                                                                             | Email adapter config and types.                                                                                                                                                                                                                                                                                                                                                |
| Auth tokens are versioned                                                                                                                                             | Admins must sign in again.                                                                                                                                                                                                                                                                                                                                                     |
| Lexical 0.41 → 0.52; `HTMLConverterFeature`/`lexicalHTML` removed                                                                                                     | Check `utils/lexical.ts`, which uses `convertLexicalToHTML`.                                                                                                                                                                                                                                                                                                                   |
| `@payloadcms/ui` no longer depends on `next`; Next subpath exports move to `@payloadcms/ui`                                                                           | Custom admin components and the import map.                                                                                                                                                                                                                                                                                                                                    |
| Legacy `migrateCLI` removed; `bin` replaced by `cli.commands`                                                                                                         | Check the seed and `payload run` scripts.                                                                                                                                                                                                                                                                                                                                      |

---

## 2. The TanStack Start integration

**[fact] It exists and has shipped as beta.**

- Package: `@payloadcms/tanstack-start@4.0.0-beta.2`, described as "TanStack Start framework adapter for Payload".
- It has been on npm under `4.0.0-internal.*` since 2026-06-09 (`npm view @payloadcms/tanstack-start time`).
- Source code: https://github.com/payloadcms/payload/tree/main/packages/tanstack-start
- There is no 3.x version. Its peer dependency is `payload: 4.0.0-beta.2`.

**[fact] Peer dependencies of `@payloadcms/tanstack-start@4.0.0-beta.2`, compared with ours**

| Peer                     | Required    | Ours                       |
| ------------------------ | ----------- | -------------------------- |
| `vite`                   | `>=8.0.0`   | `^8.0.10` (ok)             |
| `@tanstack/react-start`  | `^1.169.1`  | `^1.168.11` (needs a bump) |
| `@tanstack/react-router` | `^1.170.44` | `^1.170.8` (needs a bump)  |
| `@vitejs/plugin-rsc`     | `^0.5.21`   | not installed (new)        |
| `@vitejs/plugin-react`   | `^6.0.0`    | `^6.0.1` (ok)              |

`graphql` and `react`/`react-dom` 19 are also peers.

**[fact] How it works**

- `vite.config` wraps the config in `withPayload(builder, { payloadConfigPath })`. The builder instantiates `rsc(pluginOptions.rsc)`, `tanstackStart(...)` and `viteReact(...)`.
- `@vitejs/plugin-rsc` is a hard singleton.
- Nitro is supported: `nitro(pluginOptions.nitro)`, "only if the app deploys through Nitro". We use Nitro.
- Sources:
  - `packages/tanstack-start/src/withPayload/index.ts`: https://github.com/payloadcms/payload/blob/main/packages/tanstack-start/src/withPayload/index.ts
  - template: https://github.com/payloadcms/payload/blob/main/templates/blank-tanstack/vite.config.ts

**[fact] Route layout**

- Admin and API live under a `_payload` pathless layout route:
  - `admin.$.tsx` and `admin.index.tsx` are the admin pages.
  - `api.$.ts` serves REST and GraphQL.
  - `server.functions.ts` holds the admin server functions.
- Deleting `api.$.ts` disables both REST and GraphQL.
- Source: `docs/admin/overview.mdx`, "Project Structure / TanStack Start", https://payloadcms.com/docs/beta/admin/overview

**[fact] Build and deploy**

- The build is Vite's. The template starts with `srvx --prod ... --entry=dist/server/server.js`.
- The template's build script sets `NODE_OPTIONS=--max-old-space-size=8000` for the build.
- Sources:
  - https://github.com/payloadcms/payload/blob/main/templates/blank-tanstack/package.json
  - https://payloadcms.com/docs/beta/production/deployment

**[fact] Supported vs. not yet supported**

| Feature                             | Status                                                                                  | Source                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Admin panel                         | Supported                                                                               | installation docs, https://payloadcms.com/docs/beta/getting-started/installation |
| REST + GraphQL                      | Supported (`api.$.ts`)                                                                  | admin/overview                                                                   |
| Local API                           | Supported (framework-independent)                                                       | local-api/overview                                                               |
| Server-side live preview            | Supported; use `router.invalidate()` instead of `router.refresh()`                      | https://payloadcms.com/docs/beta/live-preview/server                             |
| Draft preview                       | **No `draftMode()` equivalent.** You implement your own server function and cookie.     | https://payloadcms.com/docs/beta/admin/preview                                   |
| Custom admin route (`routes.admin`) | **"TanStack Start does not yet support customizing the Admin Panel's route location."** | https://payloadcms.com/docs/beta/admin/admin-panel-location                      |
| Storage adapters                    | Framework-independent, same adapters                                                    | upload/storage-adapters                                                          |
| Framework-agnostic admin            | `@payloadcms/ui` "no longer depends on `next`"; adapter pattern via `RouterAdapter`     | migration guide v4                                                               |

**[fact] TanStack Start 1.x is stable.** It was declared stable on 2026-10-12, and Vite 8 is required for RSC. Source: https://github.com/TanStack/router/pull/8696

**[announced]** The June blog post describes the framework adapter pattern as covering "admin rendering, React Server Components, loaders, and API mounting", with the goal of keeping the same Payload config across frameworks. It notes the TanStack demo had "CSS issues to work through" at the time. Source: the blog post above.

**[inference] Effects of the custom admin route limitation and the RSC plugin**

- Our config mounts admin at `/` (`config.ts:84`). In a merged app the website owns `/`, so admin would move to the default `/admin` anyway. The limitation is therefore harmless for us.
- Adding `@vitejs/plugin-rsc` applies to the whole website build. Chakra UI and Emotion together with RSC is an unverified risk: client and server boundaries and CSS-in-JS. Test it in the spike.

---

## 3. Can Payload 3.x be embedded in a non-Next app today?

- **[fact]** Payload "can be used completely outside of Next.js", including the Local API in other frameworks such as SvelteKit, Remix and Nuxt. In 3.x the admin panel requires Next.js. Source: https://payloadcms.com/docs/local-api/outside-nextjs
- **[fact]** This repo already does exactly that: the TanStack Start server functions call the Local API (`apps/website/src/server/db.ts`). The admin stays in the Next app.
- **[fact]** A known pitfall: Vite trying to bundle `file-type` for Payload 3 in TanStack Start. A maintainer replied that server-only imports should never reach the browser bundle. Source: https://github.com/payloadcms/payload/issues/15002. We already exclude `payload` from `optimizeDeps` (`apps/website/vite.config.ts`).
- **Conclusion:** the "Local API in the website, admin elsewhere" architecture is the officially supported 3.x pattern, and we already have it. The only thing 3.x cannot do is host the admin UI in TanStack Start.

---

## 4. Does a single app remove presigned URLs?

**No. [fact + inference]**

- **[fact]** Railway buckets are private: "Public buckets are currently not supported". Files are served through presigned URLs or by proxying through the service. "Bucket egress is free" and service egress is not. Source: https://docs.railway.com/storage-buckets
- **[fact]** With `signedDownloads`, Payload 3.91's S3 `getFile` presigns and returns `Response.redirect(signedUrl, 302)`, with a default `expiresIn` of 7200. Source: https://github.com/payloadcms/payload/blob/v3.91.0/packages/storage-s3/src/getFile.ts (lines ~102-118).
- **[inference]** Same-origin serving would make `/api/pictures/file/x` resolve on the website's own domain. It would still do one of two things:
  - a DB lookup plus a 302 to a fresh presigned URL, which is uncacheable (the problem ADR-0003 solved), or
  - streaming the bytes through Node, which is billed egress plus memory pressure (rejected in ADR-0003).

  The cause is the private bucket, not the origin split. ADR-0003 stays valid after a merge.

**What a merge would simplify [inference]**

- One service holds the `S3_*` credentials instead of two (ADR-0003 consequence 1).
- The `BACKEND_URL` / `VITE_BACKEND_URL` fallback disappears.

**Alternatives available in 3.x [fact for the options, inference for the fit]**

- **`generateFileURL`** (async; receives `collection`, `filename`, `prefix` including the `_objectKey` folder, and `size`).
  - It runs in the cloud-storage `afterRead` hook, and when set it overrides the stored URL.
  - Source: https://github.com/payloadcms/payload/blob/v3.91.0/packages/plugin-cloud-storage/src/hooks/afterRead.ts and `types.ts:120-125`.
  - [inference] We could move the day-stable signing from `media-urls.ts` into `generateFileURL` in `storage.ts`. Every Payload consumer, admin included, would then get cacheable signed URLs, and the website's recursive `withMediaUrls` walker would no longer be needed.
  - Caveat: it would sign on every read, admin included, and it depends on the `_objectKey` folder layout. That is worth an ADR-0003 follow-up rather than part of this bump.
- **`disablePayloadAccessControl: true` + `generateFileURL`** points URLs straight at a public bucket or CDN. The docs advise this only when collection `read` is already public. Source: https://payloadcms.com/docs/upload/storage-adapters ("Payload Access Control" and the R2 example). It is not possible on Railway buckets, so it would require moving storage to a provider with public buckets, such as R2 with a custom domain. That is a provider change, out of scope here.

---

## 5. Memory

- **[fact]** Railway RAM costs $10 / GB / month and vCPU $20 / month. Source: https://docs.railway.com/reference/pricing/plans
- **[fact]** I found **no primary-source memory figures** from Payload for v3 or v4, and no v4 performance claims. The 4.0 blog post cites adoption stats only. `docs/performance/overview.mdx` only mentions avoiding memory leaks in hooks.
- **[fact]** Our setup runs two Node processes, and each runs `getPayload` with the full config (§0). The CMS adds the Next.js 16 server runtime on top.

**[estimate] What a single process would save**

- Savings ≈ steady RSS of the CMS service − extra RSS in the website for admin routes. Admin RSC/UI modules load lazily on admin requests.
- The duplicated pieces are: Node baseline, a second Payload init (config sanitization, Drizzle schema), a second `pg` pool, a second sharp/libvips, and the Next.js runtime and caches.
- I can't put a number on it without per-service metrics. The reported 1–1.5 GB is project-wide and may include Postgres.
- **Action:** read the per-service memory graphs on Railway. At $10/GB-month, each 0.5 GB of steady RSS removed is about $5/month. Example [estimate]: if the CMS sits at ~500 MB and admin routes add ~100–150 MB to the website, a merge saves ~$3.5–4/month.

**[fact] Cheaper interim lever: Railway Serverless (app sleeping)**

- A service sleeps after 5–10 minutes with no outbound packets and wakes on inbound traffic. The first request has a cold boot and may return a 502.
- Things that keep a service awake include DB poolers holding connections open and Next.js telemetry.
- Source: https://docs.railway.com/reference/app-sleeping

**[inference] Why it fits the CMS**

- In production the website does not call the CMS (it signs media itself, `media-urls.ts`), so the CMS only receives editor traffic and is a good sleep candidate.
- Set `NEXT_TELEMETRY_DISABLED=1`.
- Verify that the `pg` pool releases idle connections. node-postgres closes idle clients after `idleTimeoutMillis`, default 10 s (not verified here). Otherwise the service will never sleep.
- **Caveat:** the docs do not say how sleeping time is billed. Verify on the invoice after a week.

---

## 6. Recommendation

1. **Now:** finish the 3.91.0 bump on this branch. Do not adopt v4 beta in production.
   - The policy says prereleases "make no promises to each other" and migration guides only cover stable → stable. Source: https://payloadcms.com/docs/beta/migration-guide/versioning
   - Beta.0 through beta.2 shipped within one week.
2. **Interim (this month):**
   - Enable Railway Serverless on the CMS service and measure.
   - Optionally, write an ADR-0003 follow-up to move signing into `generateFileURL`.
   - Neither change requires v4.
3. **Spike (time-boxed, separate branch):**
   - Create `npx create-payload-app@beta` with the TanStack template, or run the codemod on a copy of this repo.
   - Mount the admin inside `apps/website` and check:
     - Chakra/Emotion with `@vitejs/plugin-rsc`
     - Nitro with `pluginOptions.nitro`
     - admin login and uploads to the Railway bucket
     - the `sizes-to-variants` migration on a prod DB copy
     - `overrideAccess` on every server function
     - RSS of the merged process compared with today's two services

**Risks**

- Beta churn.
- The v4 `overrideAccess` default, which silently empties public reads for 6 of our 9 collections.
- The upload `variants` change, which hits ADR-0003 and `picture-src.ts`.
- Mandatory DB migrations (versions, authorship, uploads, jobs).
- Node 24.15 on Railway.
- RSC plugin interaction with Chakra.
- An admin crash or OOM would now take the public site down, which today is isolated. [inference]
- Plugin compatibility is a low risk: all our plugins are first-party and all have `4.0.0-beta.2` versions (`npm view @payloadcms/<pkg>@beta`).

**Migration trigger (all must hold)**

1. `payload` `latest` is `4.x` and at least one `4.0.x` patch has shipped. Check with `npm view payload dist-tags`.
2. `@payloadcms/tanstack-start` is published on `latest` and the beta banner is gone from the docs.
3. The spike shows the merged process RSS is clearly below the sum of the two current services, with no Chakra/RSC blockers.
4. The `sizes-to-variants` and versions/authorship migrations pass on a copy of the prod DB.

## 7. Spike results (2026-10-18, branch `spike/payload-v4-tanstack-start`)

The spike was run on a copy of the local dev DB (639 reports, 18 pictures, 1,318 tags) with S3 off. It covered `payload@4.0.0-beta.2`, `@payloadcms/tanstack-start@4.0.0-beta.2` and TanStack Start 1.169. `apps/cms-payload` (Next.js) is deleted, and the admin, REST API and website run as **one Vite/TanStack Start app** (`apps/website`).

### What works (verified in a browser and with curl, dev and production build)

- **Website:** every page renders in dev and in the production build (`/`, `/reports`, `/interviews`, `/tags`, `/carte`). Chakra/Emotion works under `@vitejs/plugin-rsc`, which was the main open risk.
- **Admin at `/admin`:**
  - It works in French: login, dashboard, list views, edit views.
  - `PictureNav` works after porting it to `useRouter` from `@payloadcms/ui`, `data` (was `savedDocumentData`) and `Button size="medium"` (`small` was removed).
- **REST API at `/api`:** works on the same origin as the site. Unsigned upload URLs are now plain same-origin paths, so `BACKEND_URL`/`getBackendUrl` are deleted.
- **Uploads:** `sharpTransformer` creates the 400×300 `thumbnail` variant. New docs also get `original` metadata. New files get an `-original` suffix in their filename (`spike-upload-original.png`).
- **Migrations:**
  - The predefined `payload migrate:create --file @payloadcms/db-postgres/sizes-to-variants` renames the 6 `sizes_thumbnail_*` columns, and all 18 thumbnails were kept.
  - A plain `migrate:create` then adds:
    - the `original_*` and `variants_thumbnail_{prefix,_objectkey}` columns
    - the new core `payload_llm_instructions` tables
  - Both migrations applied cleanly.
- **Checks:** type-check (website and database), 19/19 unit tests, oxlint and oxfmt all pass.

### Changes the migration needed (all in the spike diff)

| Area                                     | Change                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codemod (`npx @payloadcms/codemod@beta`) | `versions: false`/`authorship: false` on every collection (keeps the v3 schema). It added `overrideAccess: true` only to direct `payload.*` calls: 5 in database seed/utils plus `tools.ts`.                                                                                                                                                                                                      |
| `overrideAccess`                         | The codemod missed the 22 `context.db.*` calls in `apps/website/src/server`, which were updated by hand. Without this, public reads fail on collections without `access.read`.                                                                                                                                                                                                                    |
| Config                                   | `storage: [storageAdapter()]` (was a plugin). `alwaysInsertFields` removed, because v4 always adds the prefix column. `sharp` → `upload.transformers: [sharpTransformer({ collections })]`. `routes.admin: "/admin"`. `defaultDepth: 2` keeps the website's relations filled in, since v4 lowered the default to 1.                                                                               |
| Website data shape                       | `sizes.*` → `variants.*` in `media-urls.ts`, `picture-src.ts` and their tests.                                                                                                                                                                                                                                                                                                                    |
| TanStack                                 | `src/routes` → `src/app` (Payload's convention; the import map and `payload build` detect it with no config). `withPayloadRoot(RootDocument)`. `payloadParseSearch`/`payloadStringifySearch` on the router. The adapter needs TanStack Start ≥ 1.169, which renames `.inputValidator(` → `.validator(` (13 calls). `react-router-ssr-query` 1.167.3 and `react-query` 5.104 were needed to match. |
| Tooling                                  | TypeScript ≥ 6.0.3 and Node ≥ 24.15 (guide). `build` is now `payload build` (generates the import map and types first).                                                                                                                                                                                                                                                                           |

### Problems found and fixed

1. **Nitro breaks the production build.**
   - With `nitro(pluginOptions.nitro)`:
     - every SSR page threw `ContextError: … forgot to wrap component within <ChakraProvider />`
     - the file route failed with `Cannot find package 'strtok3'`
     - `tslib` needed a manual external
   - In dev, Nitro also answered `/api/<upload>/file/*.png` with a 404 before Payload saw it.
   - **Fix:** drop Nitro and serve like Payload's own `templates/blank-tanstack`: `payload build` → `dist/`, `start: srvx --prod --dir=. --static=dist/client --entry=dist/server/server.js`. Every route then returns 200.
   - **Cost:** we lose Nitro's `compressPublicAssets` pre-compression. This needs a replacement (a Vite compression plugin or compression in srvx) before production, because Railway egress is billed.
2. **Dev: the file route returns 500 after the admin loads** (`Vite module runner has been closed`, from `file-type`'s lazy imports). Fix: `withPayload(..., { devServerExternalPackages: ['file-type'] })`.
3. **pnpm strict layout:** the adapter keeps DB adapters and server-only leaf packages external. `@payloadcms/db-postgres`, `@payloadcms/email-nodemailer`, `@payloadcms/transformer-sharp`, `pg` and `nodemailer` had to become direct `apps/website` dependencies.
4. **The search-param serializer is router-wide (`qs`).** Our `validateSearch` schemas already coerce, so they work. Old shared links in the JSON format (`?category=[1,2]`) will no longer validate.
5. **Auth:** v4 JWTs carry an auth version. Sessions from the v3 CMS are not valid on v4, and the reverse is also true, so every editor has to sign in again once after the switch.

### Memory: same data, same load, macOS `footprint` (physical footprint), production builds

Scenario for both setups:

- boot
- warm up 7 site pages and 6 signed-in admin pages
- 400 report detail pages and 100 signed-in admin pages

|                                                    | Boot                   | Warm                   | Peak over the run      |
| -------------------------------------------------- | ---------------------- | ---------------------- | ---------------------- |
| **v3 today: website (Nitro) + CMS (`next start`)** | 112 + 205 = **317 MB** | 122 + 222 = **344 MB** | 290 + 300 = **590 MB** |
| **v4 spike: one app (srvx)**                       | **176 MB**             | **291 MB**             | **432 MB**             |

- **[measured]** At peak, one process uses **~160 MB (≈27%) less** than the two current services combined. The admin no longer pays for a second Payload boot, a second `pg` pool or Next.js.
- **[measured, extra overhead]** Each service that starts through `pnpm` keeps a `pnpm` node process alive: **~56 MB footprint** each, measured here with one wrapper level. On Railway the start commands are `pnpm serve:web` / `pnpm serve:admin`, which run `cd … && pnpm start`. That makes two `pnpm` levels per service, so roughly 4 wrapper processes today against 2 after merging. **This is a quick win that doesn't need v4:** start each Railway service with `node` directly, e.g. `node apps/website/.output/server/index.mjs` and `node_modules/.bin/next start` in `apps/cms-payload`.
- **[estimate]** macOS footprint is not the same as Railway's Linux container memory, and real traffic isn't this synthetic load. The absolute numbers will differ on Railway; the relative gap is what matters. Re-measure on Railway with a preview environment before deciding.

### Open after the spike

- The S3 path wasn't tested: no bucket credentials locally. The `signedDownloads` + transformer path (the file route calls `staticHandler` with `operation: 'transform'`) and ADR-0003's day-stable signing still need checking against the Railway bucket.
- Railway deploy wasn't tested: Node 24.15 image, srvx start command, a single service with `/admin` on the public domain.
- The admin is now on the public site's domain. Decide whether `/admin` needs extra protection (rate limits, IP allow-list), and keep in mind that an admin OOM now takes the site down too.
- Docs still describe two apps: `README.md`, `docs/CONTEXT.md` and the ADR-0003 fallback paragraph.
- The adapter still has no custom admin route and no `draftMode()` (see §2).

---

## Not verified / open questions

- The stable date for v4: no maintainer statement found.
- Whether TanStack Start mode supports every admin feature the Next adapter has, beyond the documented gaps (custom admin route, `draftMode`). There is no feature-parity table.
- The actual per-service RAM on Railway, and whether the 1–1.5 GB includes Postgres.
- Billing of sleeping services on Railway, and whether the CMS's `pg` pool lets it sleep.
- ~~Chakra UI v3 / Emotion compatibility with `@vitejs/plugin-rsc`.~~ Works in dev and with the srvx production build; breaks only with Nitro (see §7).
- The full migration guide (https://payloadcms.com/docs/beta/migration-guide/v4) was later read in full and checked against the spike. Items that do not apply here: jobs, API keys, Lexical HTML converters, clientUploads, plugin-added collections.
