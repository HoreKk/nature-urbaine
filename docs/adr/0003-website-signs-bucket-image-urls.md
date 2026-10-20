# The website presigns Railway bucket image URLs itself, day-stably, instead of routing images through the CMS

Every server function that returns `Picture` or `Media` docs passes its result through `withMediaUrls` (`apps/website/src/server/media-urls.ts`), which replaces Payload's `/api/<collection>/file/<name>` paths with presigned URLs to the Railway bucket. The signing date is pinned to the start of the current UTC day so the URL is identical for every request and instance that day, and browsers can cache it. Cards use the existing 400×300 `sizes.thumbnail`; nothing changes in the Payload collections, the CMS S3 plugin config, or stored objects.

## Status

accepted — 2026-09-27

## Context

Railway buckets are private: there are no public object URLs, presigned URLs are the supported way to serve files, bucket egress is free, and service egress is billed ([docs](https://docs.railway.com/storage-buckets)). The CMS uses `@payloadcms/storage-s3` with `signedDownloads: true`, so each image request hits Next.js + Payload, runs a `find` on the collection by filename to resolve the S3 prefix, presigns a URL and answers with a 302. Every URL is unique, so browsers never reuse their cache: each page view re-fetches every image from the bucket and costs the CMS one request per image.

On the website, `@unpic/react` rendered plain `<img>` tags with no `srcset`, no lazy loading and the original file (average 662 kB, up to 9.6 MB on the local sample) even for 300 px cards. A catalog page of 50 reports could pull tens of megabytes.

The production catalog is large, so regenerating image sizes, changing formats, or editing the `Picture` collection was ruled out.

## Decision

- **Signing moves to the website.** The website already holds each upload doc (filename, collection) from the Payload local API, so it can build the object key `<collection>/<filename>` and sign it with the same `S3_*` credentials the CMS uses. No DB lookup, no 302, no CMS request per image.
- **Deterministic per UTC day.** `getSignedUrl` is called with `signingDate` set to UTC midnight and `expiresIn` of 7 days (the SigV4 maximum). The URL is stable for the whole day across instances, so browser caches hit. A `response-cache-control: public, max-age=86400` is baked into the signature so the bucket tells browsers to keep the file.
- **Fallback.** Without `S3_*` variables (local dev) URLs stay Payload's same-origin `/api/<collection>/file/*` paths.
- **Sizes.** `utils/picture-src.ts` picks `sizes.thumbnail` for cards and grids (never the original), the original alone for carousels and lightboxes (`object-fit: contain`, where the centre-cropped thumbnail is not a valid `srcset` candidate), and original + thumbnail `srcset` only for full-bleed `object-fit: cover` heroes. Docs uploaded before the thumbnail size existed fall back to the original.
- **Rendering.** One `PictureImg` component emits `loading="lazy"`, `decoding="async"`, intrinsic dimensions and `srcset`. `@unpic/react` is removed.

## Update 2026-10-18: Payload 4, one app

Admin, API and site now run in one TanStack Start process; this decision still holds, because the bucket is still private. Two Payload 4 changes touch it:

- Upload URLs carry `?prefix=<prefix>`, and new files are stored under `<prefix>/<_objectKey>/<file>`. `media-urls.ts` builds the key with plugin-cloud-storage's read rule (`[prefix, _objectKey].join('/') || <collection>`, per doc and per variant), the same rule `storage:check` uses. Rows from before the upgrade have no `_objectKey` and keep `<collection>/<file>`.
- `sizes` became `variants` (`variants.thumbnail`); `picture-src.ts` and `withMediaUrls` read `variants`.
- Only one service holds the `S3_*` variables now.

## Update 2026-10-18: uncropped variants for galleries

The migration trigger below fired. Report pages with 200+ Pictures loaded the ~4000×3000 originals in the banner, carousel and lightbox. A browser kept every visited slide decoded (~46 MB each, 1.15 GB after 20 photos), and report 752 alone references 787 MB of originals.

- `Picture` gets two uncropped WebP variants next to `thumbnail`: `medium` (1024 px wide) and `large` (2048 px wide), both `withoutEnlargement`. They are defined once in `packages/database/src/image-variants.ts`.
- The "Sizes" rule above changes:
  - Carousels and lightboxes now get `medium` + `large` in `srcSet`, and the original only while a row has no variant yet.
  - Heroes get `thumbnail` + `medium` + `large`.
  - The cropped thumbnail is still never offered to `object-fit: contain`.
- Re-processing the catalogue is no longer ruled out, because it can be done additively. `storage:variants:backfill` (`packages/database/src/scripts/backfill-variants.ts`) works as follows:
  - It reads each original and writes only the missing variants as new keys.
  - New keys follow Payload's naming, `<name>-<w>x<h>.webp`, suffixed `-1`, `-2`… when the name is taken. Pre-v4 rows share one flat folder, so `parc.jpg` and `parc.png` would otherwise collide.
  - It tags each object with its picture id, so a rerun reuses only its own files.
  - It never overwrites or deletes an object, and only fills empty `variants_*` columns.
- The backfill runs once, by hand, after the deploy, not in the pre-deploy command: ~19.3k Pictures take hours, and one unreadable file must not block a release. Until it finishes, pages fall back to the originals.
- `withMediaUrls` already signs every `variants.*` entry, so signing needed no change.
- Carousels and lightboxes also mount only the current slide ±1, so memory no longer grows with the number of photos viewed.

## Considered alternatives

- **Public bucket / CDN base URL.** Not available on Railway ("public buckets are currently not supported").
- **Proxy bytes through the website or CMS.** Turns free bucket egress into billed service egress and adds memory pressure.
- **Adding responsive image sizes to the `Picture` collection.** Best long-term, but requires regenerating every stored object; deferred until the catalog can be re-processed safely. Done on 2026-10-18, see the update above.

## Consequences

- The website service needs the same five variables as the CMS: `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`. Rotating the bucket key means rotating it in both services.
- `og:image` URLs expire after 7 days; crawlers that cache longer will get a 403 until they re-crawl.
- `Media` (interview thumbnails, portraits) has no image sizes, so those still load originals; only caching improves there.
- Migration trigger: when the catalog can be re-processed, add `imageSizes` (e.g. 800/1600 WebP) to `Picture` and extend `picture-src.ts`; `withMediaUrls` already rewrites every entry in `sizes`.
