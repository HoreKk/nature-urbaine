# Nature Urbaine — GLOSSARY

> Single source of project-level domain truth for agents. Pair with `docs/adr/` for decisions and `/Users/horek/Downloads/design_handoff/` for the design specification.

## 1. What this project is

Nature Urbaine is a **public collaborative French-language platform for urban-landscape professionals** (paysagistes, maîtres d'ouvrage, maîtres d'œuvre, urbanistes). It is a large, growing **catalog of urban-landscape projects** ("reportages photos"), enriched by **interviews** with the people behind them, and intended to grow indefinitely without losing search/browse performance.

The specification (`SITE_cahier-des-charges`) frames it as:

- "La plateforme collaborative dédiée aux professionnels de l'aménagement des espaces extérieurs."
- "Une grande base de données pour les professionnels de l'aménagement."
- Each image and reference is a community contribution — visitors are explicitly invited to add their own.

### Audience and tone

- **Users:** non-technical urban-landscape professionals.
- **Voice:** sober, editorial, French only, image-forward, light-mode only. No "tech-startup" patterns.
- **Disclaimer requirement (spec):** the site must visibly state that data is indicative, has often been sourced from the web or third parties, and may contain errors that users can flag through the contact form.

### Out-of-scope for the current MVP slice

The cahier des charges describes more than the current build covers. The following are documented but **not yet built** (track in `docs/adr/` if/when prioritized):

- **Fournisseurs** directory (supplier listings, with categories, images, contacts).
- **Page Lieux** — alphabetical index of locations (France first, then étranger).
- **Image right-click → save** with email gating, plus the connection log meant to be sold to suppliers.
- The **2 000+-keyword tag database** (only a sample is wired today).
- **Authentication / user accounts** beyond CMS admin.
- **Maintenance mode** during build, plus annual maintenance contract.
- **Real satellite map tiles** (replace the placeholder map with Mapbox / MapLibre satellite).
- **i18n** (UI is French only).

## 2. Architecture at a glance

One app serves the site, the Payload admin and Payload's REST API from one process. PostgreSQL is the single backing store.

```
nature-urbaine/
├── src/
│   ├── app/             ← TanStack Start routes; Payload admin + REST under app/_payload/
│   ├── components/      ← site UI (only `import type` from payload/, lint-enforced)
│   ├── server/          ← server functions (Payload local API)
│   ├── payload/         ← Payload config, collections, admin components, types, migrations, seed, scripts
│   ├── emails/          ← React Email templates, layout, render helpers, previews
│   └── payload.config.ts
├── GLOSSARY.md          ← this file
├── docs/
│   ├── agents/          ← how agents consume this glossary + where issues live
│   └── adr/             ← architecture decision records (lazy)
└── CLAUDE.md            ← agent skills entry point
```

### Stack

- **Public website** — React 19, **TanStack Start** (SSR + server functions), **TanStack Router** (file-based routes under `src/app/`, Payload's admin and API routes under `src/app/_payload/`), **TanStack Query** for data fetching, **Chakra UI 3** for primitives, **TanStack Form** + Zod for forms, a small `PictureImg` component (`components/standard/PictureImg.tsx`) over Chakra `Image` for pictures, fed by `utils/picture-src.ts`; upload URLs are made browser-fetchable server-side by `server/media-urls.ts` (see §7 and ADR-0003). Built via Vite (`payload build`) and served by Nitro (`.output/server/index.mjs`).
- **CMS (same app)** — **Payload 4 (beta)** through `@payloadcms/tanstack-start` and `@vitejs/plugin-rsc`, admin at `/admin`, REST at `/api`, with `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3` and `@payloadcms/transformer-sharp` (`Picture` variants `thumbnail`, `medium`, `large`; see `src/payload/image-variants.ts`). No Next.js.
- **Payload code (`src/payload/`)** — the Payload `config`, generated TypeScript types (`Report`, `Interview`, etc.), Lexical helpers, migrations / seed scripts, and the SMTP email adapter configuration used by `payload.sendEmail`. Imported as `@/payload/<module>`; `src/payload.config.ts` (`@payload-config`) is the app's config entry.
- **Emails (`src/emails/`)** — React Email templates and typed render helpers (`renderContactEmail`) used by server functions. Local preview runs via `pnpm dev:emails` on port `4000`.
- **Tooling** — `pnpm@10`, `oxlint`, `oxfmt`, `lefthook`. Migrations and seeding are `package.json` scripts (`pnpm migrate`, `pnpm seed:dev`, etc.).

The website talks to the database via **TanStack Start server functions** (`src/server/*.ts`) that call Payload's local API in-process, always with `overrideAccess: true` (Payload 4 defaults it to `false`, and most collections have no public `read`). The REST API at `/api` serves the admin and upload files.

## 3. Glossary

When writing code, prompts, ADRs, or copy, **use these exact terms** in their column. The French label is the user-facing one; the code term is what appears in collections, types, and route files.

| Domain concept (FR)                      | Code term (EN)                                                              | Notes / Don't say                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reportage photo                          | `Report` (collection slug `reports`)                                        | Core fact-sheet about a project. Do **not** call it `project` in code — `projectName` / `projectDetails` are sub-fields of a Report.                                                                                                                                                                                                                            |
| Interview / À la une / À la rencontre de | `Interview` (slug `interviews`)                                             | Q&A article about the people behind a project. The "À la une" page is the interview index.                                                                                                                                                                                                                                                                      |
| Question d'interview                     | `Interview.questions` (array)                                               | One question/answer row of an Interview: `question` (text) + `answer` (Lexical). Editable per Interview; new Interviews start from the cahier's three questions (`DEFAULT_INTERVIEW_QUESTIONS`).                                                                                                                                                                |
| Photo                                    | `Picture` (slug `pictures`), `InterviewPicture` (slug `interview-pictures`) | A single image owned by one Report (`Picture`) or one Interview (`InterviewPicture`): one upload collection per owner, both from `picture-collection.ts` (ADR-0004). Spec calls these "miniatures" / "images" — keep `Picture` in code. Only Report photos are tagged and appear in tag search.                                                                 |
| Catégorie de reportage                   | `Category` (slug `categories`)                                              | The 12 fixed categories (see §5). Used to tag a Report and to color/filter everywhere.                                                                                                                                                                                                                                                                          |
| Étiquette / Mot-clef                     | `Tag` (slug `tags`)                                                         | A single keyword attached to a Picture. Hierarchical: tags can have a `parentId` tag (3 strata, e.g. `VOIRIE › BORDURE › BORDURE-A1`).                                                                                                                                                                                                                          |
| Catégorie d'étiquette                    | `TagCategory` (slug `tag-categories`)                                       | Top grouping for tags. The spec mentions vegetation strata too (e.g. `ARBRE / CONIFÈRE / ARBUSTE`) — these are TagCategories.                                                                                                                                                                                                                                   |
| Vignette                                 | `frontPicture` (derived)                                                    | Hero image of a Report or Interview card and banner. Derived from the first photo of the owner's gallery (`relatedPictures` on both) after Pictures are ordered manually (drag-and-drop, fractional indexing on the join). When the owner has zero Pictures, the UI shows a placeholder. The interviewee portrait is not a Vignette (see `intervieweePicture`). |
| Maître d'ouvrage                         | `projectOwner`                                                              | The commissioning party.                                                                                                                                                                                                                                                                                                                                        |
| Maître d'œuvre                           | `projectManagement`                                                         | The delivery / design lead. **Note:** in `Interview.ts` the `projectOwner` and `projectManagement` labels are swapped relative to `Report.ts` — this is a known quirk; treat the Report collection as canonical.                                                                                                                                                |
| Localisation                             | `locationDetails` (group field)                                             | Sub-fields: `country`, `city`, `postalCode`, `address`, `departmentCode`, `department`, `region`, `cityStratum`, `nbPopulations`.                                                                                                                                                                                                                               |
| Détails du projet                        | `projectDetails` (group field on Report)                                    | Sub-fields: `photoAuthor`, `wordpressPostId`, `projectOwner`, `projectManagement`, `deliveryYear`, `projectCost`, `projectArea`.                                                                                                                                                                                                                                |
| Saison                                   | `season`                                                                    | Auto-derived virtual field on Report from `date`. Values: `spring`, `summer`, `autumn`, `winter`. Not user-editable.                                                                                                                                                                                                                                            |
| Strate (taxonomie)                       | `Tag` parent chain                                                          | Three levels: TagCategory → Tag (level 1) → Tag (level 2) → Tag (leaf). Walk the `parentId` chain to traverse.                                                                                                                                                                                                                                                  |
| Strate (population)                      | `cityStratum`                                                               | Demographic strata of the city (see `locationDetails`). Different concept; same word.                                                                                                                                                                                                                                                                           |
| Fournisseur                              | `Supplier`                                                                  | Out of scope. No collection yet.                                                                                                                                                                                                                                                                                                                                |
| Contribution                             | `Submission` (slug `submissions`)                                           | A visitor's proposed reportage submitted via `/contribuer`. Persisted with a `status` workflow (`pending` / `accepted` / `rejected`); on accept, an `afterChange` hook creates a `Report` draft and sets `promoted` + `promotedReport`. See ADR-0001.                                                                                                           |
| Carte                                    | `/carte` route                                                              | Satellite map of pin-located reportages, colored by Category. Currently a placeholder.                                                                                                                                                                                                                                                                          |
| Lieux                                    | (not modeled yet)                                                           | A-Z list of locations is described in the spec but not implemented.                                                                                                                                                                                                                                                                                             |

## 4. Domain entities

Defined in `src/payload/collections/`. Field names below are the actual code identifiers.

### Report — `Report.ts` (slug `reports`)

The core unit. Drafts enabled (`versions.drafts.validate`). Admin title: `name`.

- Required: `name`, `description`, `category` (→ `categories`), `date`.
- Virtual / read-only: `slug` (computed from `name`), `season` (computed from `date`).
- Optional `projectName`.
- Group `locationDetails` (see Glossary).
- Group `projectDetails` (see Glossary).
- Join `relatedPictures` (← `pictures.report`, `hasMany`, `orderable: true`, `defaultLimit: 0`). The first picture in this ordered list is the **front picture** (banner + card hero). When empty, UI shows a category-tinted placeholder — not enforced at the schema level. The website's `findReportCatalog` overrides per query with `joins: { relatedPictures: { limit: 1 } }` so list pages only fetch the front; `findReportById` keeps the full ordered gallery for the carousel.

### Interview — `Interview.ts` (slug `interviews`)

All fields required. Admin title: `name`.

- `name`, `interviewee`, `intervieweeRole`, `city`, `department`, `area`, `projectOwner`, `projectManagement`, `summary`.
- Array `questions` (`minRows: 1`): rows of `question` (text) + `answer` (Lexical rich text), rendered in order on the interview page. Its `defaultValue` pre-fills the cahier's three editorial questions from `DEFAULT_INTERVIEW_QUESTIONS` (`interview-questions.ts`); editors can reword, add, remove or reorder them per Interview.
- Join `relatedPictures` (← `interview-pictures.interview`, `hasMany`, `orderable: true`, `defaultLimit: 0`) — same rules and same name as `Report.relatedPictures`; `getInterviews` overrides with `joins: { relatedPictures: { limit: 1 } }`.
- Sidebar: `realisedAt`, `publishedAt`.

The cahier specifies a **500-character summary** and **1500-character** answers per question (now per `questions` row). The CMS does not currently enforce these limits — track as an ADR if added.

### Picture — `Picture.ts` (slug `pictures`) and InterviewPicture — `InterviewPicture.ts` (slug `interview-pictures`)

Both come from `pictureCollection()` in `picture-collection.ts`: one upload collection per gallery owner, because Payload keys an orderable join's sort column by child slug + join name (ADR-0004). Admin labels « Photos de reportage » and « Photos d'interview »; both get `PictureNav` (‹ › through the owner's ordered photos). Upload-enabled (`mimeTypes: ['image/*']`), with three variants:

- a `thumbnail` 400×300 centre crop, for admin previews, cards and grids;
- `medium` (1024 px wide) and `large` (2048 px wide), uncropped WebP files for banners, carousels and lightboxes.

- `alt` (required).
- The owner, required: `report` (→ `reports`) on `Picture`, `interview` (→ `interviews`) on `InterviewPicture`.
- `relatedTags` (→ `tags`, `hasMany`), `Picture` only — the keyword tags attached to **this individual photo**, per the spec ("Toutes les images doivent pouvoir être tagguées"). Interview photos are untagged.

### Category — `Category.ts` (slug `categories`)

- `name`, `description`.
- Join `relatedReports` (← `reports.category`).
- The 12 categories are seed data and treated as fixed (see §5). Do not let users create a 13th.

### Tag — `Tag.ts` (slug `tags`)

- `name`, `description`.
- `tagCategory` (→ `tag-categories`, required).
- `parentId` (→ `tags`, optional self-reference).
- Join `relatedChildTags` (← `tags.parentId`, only shown when non-empty).

A tag is uniquely positioned in the taxonomy by `tagCategory` + `parentId` chain. Searching for `BORDURE` should return all leaf tags whose ancestor chain includes `BORDURE`.

### TagCategory — `TagCategory.ts` (slug `tag-categories`)

- `name`, `description`.
- Join `relatedTags` (← `tags.tagCategory`).
- Examples from the cahier: `VOIRIE`, `ARBRE`, `CONIFÈRE`, `ARBUSTE`.

### Media — `Media.ts` (slug `media`)

Upload collection for images that belong to no gallery: the interviewee portrait (`Interview.intervieweePicture`), contribution photos and free editorial uploads. Same three variants as `Picture`. **Neither Reports nor Interviews take their hero from Media** — it is `relatedPictures[0]` (a `Picture` or an `InterviewPicture`).

### Users — `Users.ts` (slug `users`)

Email/password auth. CMS admin only.

### Relationships summary

```
Category ─1─⟶ N Report ─1─⟶ N Picture ─N─⟶ N Tag ─N─⟶ 1 TagCategory
                                                       │
                                                       └─0..1─⟶ Tag (parentId, self-ref)

Interview ─1─⟶ N InterviewPicture   // same gallery + Vignette rule as Report
Interview ─0..1─⟶ Media (intervieweePicture)
```

## 5. The 12 categories

Exact list from the cahier, with the design tokens (`/Users/horek/Downloads/design_handoff/DESIGN_SYSTEM.md`). Use these IDs in code; use the design token for any color expression (chip, dot, map pin, list row).

| Code id      | French label           | Color token        |
| ------------ | ---------------------- | ------------------ |
| `agri`       | Agriculture urbaine    | `--cat-agri`       |
| `berges`     | Berges                 | `--cat-berges`     |
| `espaces`    | Espaces publics        | `--cat-espaces`    |
| `entreprise` | Entreprise & industrie | `--cat-entreprise` |
| `equip`      | Équipement public      | `--cat-equip`      |
| `grand`      | Grand paysage          | `--cat-grand`      |
| `jardin`     | Jardin de mémoire      | `--cat-jardin`     |
| `logement`   | Logements              | `--cat-logement`   |
| `parcs`      | Parcs & jardins        | `--cat-parcs`      |
| `histor`     | Paysages historiques   | `--cat-histor`     |
| `renouv`     | Renouvellement urbain  | `--cat-renouv`     |
| `voirie`     | Voirie                 | `--cat-voirie`     |

In Payload, `Category.id` is a numeric id, not the string code above — the string id is the _design-token suffix_. Map between them in seed data.

## 6. Pages and routes

The cahier des charges defines these top-level pages: **Accueil, À la une, Lieux, Carte, Reportages photo, Fournisseurs, Contributions, Contact**. The current website implementation in `src/app/` covers a subset:

| Spec section               | Implemented route | Route file                 | Notes                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil                    | `/`               | `app/index.tsx`            | Editorial home — hero, possibilities carousel, À la une preview, categories index.                                                                                                                                                                                      |
| À la une                   | `/interviews`     | `app/interviews/index.tsx` | Interviews list; latest stacks on top per spec.                                                                                                                                                                                                                         |
| À la une — détail          | `/interviews/$id` | `app/interviews/$id.tsx`   | Full interview with the 3 Q&A blocks; spec wants prev/next at footer ("articles précédents et suivants").                                                                                                                                                               |
| Reportages photo (catalog) | `/reports`        | `app/reports/index.tsx`    | Catalog with filters: category (multi), city, free-text search. **Filter state lives in the URL** via TanStack Router `validateSearch` + `useSearch` + `loaderDeps` (re-uses `reportCatalogFilterSchema`). Pagination at 15/page. See ADR-0002.                         |
| Reportages — détail        | `/reports/$id`    | `app/reports/$id.tsx`      | Single reportage page (thumbnail, fact-sheet, Picture gallery).                                                                                                                                                                                                         |
| Recherche par étiquette    | `/tags`           | `app/tags/index.tsx`       | Tag picker. Chakra `Combobox` (type-ahead search) + `TreeView` (browsable taxonomy). URL state `?q=<text>`. Suggestion click → `/tags/:id`. Empty state: collapsed TagCategories, lazy-loaded subtrees. See ADR-0002.                                                   |
| Étiquette — détail         | `/tags/$id`       | `app/tags/$id.tsx`         | Picture grid for a tag, **recursive over descendants** (clicking `BORDURE` includes pictures tagged with `BORDURE-A1` etc.). Uses the picture-first `PictureCard`. See ADR-0002.                                                                                        |
| Carte                      | `/carte`          | `app/carte.tsx`            | Placeholder; spec calls for satellite map with category-colored pins linking to reportages.                                                                                                                                                                             |
| Contributions              | `/contribuer`     | `app/contribuer.tsx`       | Submitter-friendly subset of the spec form: `name, description, category, deliveryYear, address (BAN-autocomplete), pictures (1–5), contributorEmail`. Persisted to `Submission` with moderation workflow + accept hook. See ADR-0001.                                  |
| Contact                    | `/contact`        | `app/contact.tsx`          | Spec form: `firstName, lastName, email, sector (select), message`. One generic inbound channel, no topic picker. Sends operator notification email through `payload.sendEmail` (Payload Nodemailer adapter over SMTP) using templates from `src/emails/`. See ADR-0001. |
| Lieux                      | —                 | —                          | Not implemented. Spec wants alphabetical reportages-by-location, FR first then étranger.                                                                                                                                                                                |
| Fournisseurs               | —                 | —                          | Not implemented.                                                                                                                                                                                                                                                        |

URL convention: keep the French slug `/contribuer` but the code-side resource lives under `reports` / `interviews` / `tags` (English plurals matching collection slugs). When adding new routes, prefer the collection slug (English) for `/reports`-like resources and the spec slug (French) for spec-only pages (`/lieux`, `/fournisseurs`).

### Retired routes

ADR-0002 retired two generic routes that tried to do too many jobs. The directories were deleted outright — old URLs 404. Replacements:

- `/reports/entity/tag/:id` → `/tags/:id`
- `/reports/entity/category/:id` → `/reports?category=:id`
- `/reports/field/city/:value` → `/reports?city=:value`

Do not add new routes under `/reports/entity` or `/reports/field`. Resource pages get their own top-level route; filterable views go in URL search params on `/reports`.

## 7. Server functions (the website's data layer)

Lives in `src/server/`. All built with `createServerFn` from `@tanstack/react-start`, gated by a `baseProcedure` middleware that boots a Payload local instance (`server/db.ts`). The Payload local API is the default way the website reads data — no HTTP roundtrip to the CMS. For reads the local API can't do cheaply (whole-catalog aggregates), `context.drizzle` runs typed Drizzle queries against the tables in `src/payload/payload-generated-schema.ts` (regenerate with `pnpm generate:db-schema` after a schema change). Drizzle skips Payload access control and hooks, so keep it to public data.

| File                     | Exports                                                                                                           | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db.ts`                  | `baseProcedure`                                                                                                   | Middleware that puts a Payload instance (`db`) and its typed Drizzle client (`drizzle`) on `context`.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `report-catalog.ts`      | `findReportCatalog`, `findReportById`, `reportCatalogFilterSchema`, `REPORT_CATALOG_PAGE_SIZE`, `AugmentedReport` | Single seam for filtered, paginated Report listings — used by `/reports`, `/reports/entity/category/:id`, `/reports/field/city/:value`, and the home page. Owns the filter shape (`category`, `city`, free-text), default sort/depth, and the page-size constant.                                                                                                                                                                                                                                                                                  |
| `interviews.ts`          | `getInterviews`, `getInterviewById`                                                                               | Paginated list + detail; converts Lexical rich-text to HTML for `objectives`, `impacts`, `challenges`.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `categories.ts`          | `getAllCategories`, `getLibraryStats`, `getCategoryById`                                                          | The 12 categories + denormalized counts for the home grid.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tags.ts`                | `getTagById`, `getTagCategoriesWithRootCount`, `getTagTaxonomyStats`, `getChildTags`, `getPicturesByTagRecursive` | Tag detail + initial TreeView roots annotated with `rootTagCount` (so Chakra TreeView treats each category as a lazy-loadable branch — without a known `childrenCount`, the click-to-expand wouldn't fire) + lazy children on expand (`getChildTags`) + paginated pictures **recursively** matching a tag and all its descendants. Recursion is an application-level BFS walk over `parentId` children; see ADR-0002. `getTagTaxonomyStats` (tree counts) reads `pictures_rels` through `context.drizzle` and folds it in `tag-taxonomy-stats.ts`. |
| `submissions.ts`         | `createSubmission`                                                                                                | Persists a `/contribuer` submission. Validates input via the wire schema from `submission-contract.ts`; uploads pictures to `media` first, then creates the `Submission` row, rolling back the uploads on failure.                                                                                                                                                                                                                                                                                                                                 |
| `submission-contract.ts` | `clientSubmissionSchema`, `wireSubmissionSchema`, `SUBMISSION_*` constants                                        | Single source of truth for Submission field rules. `clientSubmissionSchema` validates the form (File-based pictures, `category` as string from the SelectField); `wireSubmissionSchema` validates the server fn input (base64 pictures, `category` as number).                                                                                                                                                                                                                                                                                     |
| `search.ts`              | `getSearchResults`                                                                                                | Global tag-only typeahead used by the home hero and the navbar popover. Returns `Tag` suggestions (leaves **and** non-leaves) with their parent-chain hints. Category and location result kinds were dropped — those are filters on `/reports`. See ADR-0002.                                                                                                                                                                                                                                                                                      |
| `tools.ts`               | `fetchOrReturnRealValue`                                                                                          | Helper that resolves either an id or an embedded doc via the Payload local API. Pattern used everywhere relations are augmented.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `media-urls.ts`          | `withMediaUrls`, `signUploadUrl`                                                                                  | Helper (not a server fn). Deep-walks a server-fn result and rewrites every upload doc's `url` / `thumbnailURL` / `variants.*.url`. With `S3_*` env set it presigns the Railway bucket object directly (key `<prefix>/[<_objectKey>/]<file>`, the same rule Payload reads with), signature pinned to the UTC day so URLs are browser-cacheable and the CMS is out of the image path; otherwise it returns Payload's same-origin `/api/<collection>/file/*` path. See ADR-0003.                                                                      |

When adding a new server function:

1. Co-locate it under `src/server/` matching the collection.
2. Validate input with Zod via `.validator()`.
3. Use `baseProcedure` for DB access.
4. Augment outputs with `fetchOrReturnRealValue` rather than depending on `depth` from Payload.
5. If the result carries upload docs (`Picture`, `Media`), return it through `withMediaUrls` so the client never sees a raw `/api/<collection>/file/…` path.

## 7b. Query layer (`src/queries/`)

A canonical **query layer** lives at `src/queries/`, one file per entity. This layer owns all `queryOptions` factories and normalises errors into a typed shape before they reach the UI.

**Rule:** route files and components never define `queryOptions` inline. They always import from `@/queries/*`. The `server/` files only export `createServerFn` definitions — never `queryOptions`.

| File                | Exports                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `report-catalog.ts` | `reportCatalogQueryOptions`, `reportByIdQueryOptions` (re-exports `REPORT_CATALOG_PAGE_SIZE`, `reportCatalogFilterSchema`) |
| `interviews.ts`     | `interviewsQueryOptions`, `interviewByIdQueryOptions`                                                                      |
| `categories.ts`     | `categoriesQueryOptions`, `categoryByIdQueryOptions`, `libraryStatsQueryOptions`                                           |
| `tags.ts`           | `tagByIdQueryOptions`, `childTagsQueryOptions`, `picturesByTagQueryOptions`                                                |
| `search.ts`         | `searchQueryOptions`                                                                                                       |

**Rationale:** A separate `packages/api` with oRPC/tRPC was evaluated and rejected because (a) the website is the only consumer — no mobile app or external client — and (b) tRPC/oRPC would introduce an HTTP roundtrip, losing the zero-latency Payload Local API advantage. The convention problem (queryOptions scattered inline in route files) is solved by the `queries/` layer at zero infrastructure cost.

## 8. Tag taxonomy details

The spec is precise; record any reinterpretation in an ADR rather than drifting silently.

- Three strata: TagCategory → Tag → child Tag (and possibly grandchild).
- Examples (from cahier):
  - `VOIRIE / BORDURE / BORDURE-A1`, `BORDURE-ARASÉE`, `BORDURE-CC1`, etc.
  - `ARBUSTE / ABELIA-À-GRANDES-FLEURS / ABELIA-X-GRANDIFLORA`
  - `CONIFÈRE / SAPIN-DE-NORDMANN / ABIES-NORDMANNIANA`
- Vegetation tags carry **French common name + Latin name**. The Latin name is the leaf id (`ABELIA-X-GRANDIFLORA`); the common name is the parent (`ABELIA-À-GRANDES-FLEURS`).
- The full taxonomy is approx. **2 000 keywords**, completed over time. Search must be:
  - Case-insensitive.
  - Type-ahead (loupe) with autocomplete suggestions starting from the same letters.
  - **Recursive**: searching `BORDURE` returns photos tagged with any descendant (`BORDURE-A1`, `BORDURE-ARASÉE`, …). Same for `ABIES` returning all `ABIES-*`.
- Each Picture must be taggable with several tags (one Picture → many Tags).

Recursive descendant matching is implemented at the application layer (BFS walk over `parentId` children, then `pictures.relatedTags: { in: [...] }`). See ADR-0002 for the trade-off and the migration triggers to a closure table.

## 9. Design system handoff (summary)

Canonical files: `/Users/horek/Downloads/design_handoff/{DESIGN_SYSTEM,PAGES,DATA_MODEL,INTERACTIONS}.md` and `prototype/`.

- **Light mode only**, warm-toned neutrals, single leaf-green accent.
- **Type families:** Newsreader (serif headlines, italic emphasis on one or two words), Instrument Sans (body), JetBrains Mono (slugs, ids, dates, mono labels).
- **Spacing:** 4-px scale; desktop content padding 56px (36px on image-heavy pages); reading column 640px.
- **Grids:** editorial 4-col (reportages), 3-col (à la une), 2-col (hero), 4-col footer.
- **Categories:** all 12 share `chroma 0.10`, `lightness 50–62%` in OKLCH — vary hue only. Never invent a 13th.
- **Components:** button (3 intents × 2 sizes), chip/tag, search bar (with type-ahead dropdown), reportage card, form inputs, dropzone, map (SVG → swap for Mapbox/MapLibre), header, footer.
- **Motion:** subtle hover lifts (-1px button, -2px card), 2.4s map-pin pulse, **no parallax**.
- **Accessibility floor:** WCAG AA contrast on text, focus visible on every interactive element, alt text required on Pictures and Media.

The site is built with **Chakra UI**. Reuse Chakra tokens; map the design-system CSS variables onto Chakra theme tokens rather than rewriting the markup.

## 10. Editorial requirements from the cahier (non-obvious)

These are spec asks that aren't captured by the data model alone — surface them in ADRs as they're addressed.

- **Prev/next at the bottom of every Interview** ("articles précédents et suivants").
- **"Vous devriez également aimer"** suggestions at the bottom of every Reportage and Interview, drawn from same Category or same geography, designed to enable infinite scroll between projects.
- **Carousel** of Pictures on Reportage detail.
- **Hero on /carte** is satellite imagery (vue du ciel) so the project's plan-masse is legible.
- **Image right-click → save** must (a) be allowed only after the user provides their email address (auth-lite gate), and (b) write to a connection log that the operator may later sell to suppliers. _No collection for this exists yet._
- **3 self-service editable templates** the site owner edits without touching code: À la une, Reportage photo, Fiche fournisseur. The Payload admin already covers the first two; Fournisseurs is pending.
- **Maintenance mode** during development, plus an "annual maintenance" SLA option.
- **Indicative-data disclaimer** must be visible somewhere on the site.

## 11. Conventions

- **Language:** code identifiers in English (`reports`, `interviews`, `pictures`); user-facing labels and CMS field labels in French. Migrations and seed comments in English.
- **Server functions:** add to `src/server/` — one file per collection, always use `baseProcedure`, validate with Zod.
- **Query layer:** add `queryOptions` factories to `src/queries/` — never inline in route files or components. Import from `@/queries/*`.
- **Filter state in URL:** any filterable / paginated list page (`/reports`, `/tags`, …) holds its filter and page state in URL search params via TanStack Router's native `validateSearch` + `useSearch` + `loaderDeps`. Never in component `useState`. Re-use the existing Zod schema (e.g. `reportCatalogFilterSchema`) as the `validateSearch` parser. `nuqs` is **not** used — it does not cover TanStack Start SSR and would split the source of truth between the loader and the component.
- **Styling:** Chakra UI primitives + design-system CSS variables. Avoid raw inline styles.
- **Forms:** TanStack Form + Zod. Re-use `useAppForm` from `src/hooks/form-context.ts`.
- **Migrations:** never hand-edit DB; use `pnpm migrate:create` then `pnpm migrate`.
- **Seeds:** `seed:dev` rebuilds a local database from `historic-data.xlsx` and refuses a remote one. Production is the source of truth; nothing seeds it.
- **ADRs:** when an ambiguity in the cahier is resolved, write `docs/adr/NNNN-<slug>.md` so the decision survives. Reference contradicted ADRs explicitly per `docs/agents/domain.md`.
- **Code style** (comments, JSX layout): see `docs/CODING_STANDARDS.md`.

## 12. Open questions

Track in `docs/adr/` as they're answered.

- ~~Should `Submission` (Contribuer form persistence) live as a Payload collection with workflow states (`pending` / `accepted` / `rejected`), or be sent by email only?~~ **Resolved by ADR-0001** — Payload collection with workflow states and `afterChange` accept hook.
- The cahier wants per-photo right-click save behind email gating + a connection log. What schema models the log, and who consumes it?
- The label swap between `Report.projectOwner` / `projectManagement` (correct) and `Interview.projectOwner` / `projectManagement` (swapped) needs a one-line migration or a documented intent.
- ~~Tag autocomplete + recursive descendant search: is this implemented in `server/search.ts`, or only at the SQL level?~~ **Resolved by ADR-0002** — app-level BFS walk on `/tags/:id` load; tag-only typeahead in `server/search.ts`; migrate to closure table when latency / descendant-count triggers hit.
- `region` is free-text in `locationDetails` and not currently filterable on `/reports` (only `city` is, per ADR-0002). Decide whether to enum / derive-from-`departmentCode` or leave as-is.
- Carte page: target tile provider — Mapbox or MapLibre? Pricing and self-hosting trade-off should be an ADR.
- Categories table currently keys by numeric id; the design system keys by short string code (`agri`, `berges`, …). How is the mapping seeded and kept in sync?
