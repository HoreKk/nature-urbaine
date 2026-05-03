# Nature Urbaine — CONTEXT

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

A pnpm + Turbo monorepo with two apps and shared packages. PostgreSQL is the single backing store.

```
nature-urbaine/
├── apps/
│   ├── website/         ← public site (Vite + TanStack Start + React 19)
│   └── cms-payload/     ← Payload CMS admin (Next.js 16, port 3001)
├── packages/
│   ├── database/        ← @nature-urbaine/database — Payload config, collections, types, migrations, seeds
│   └── emails/          ← @nature-urbaine/emails — React Email templates, layout, render helpers, preview
├── docs/
│   ├── agents/domain.md ← how agents should consume this CONTEXT
│   └── adr/             ← architecture decision records (lazy)
└── CLAUDE.md            ← agent skills entry point
```

### Stack

- **Public website (`apps/website`)** — React 19, **TanStack Start** (SSR + server functions), **TanStack Router** (file-based routes under `src/routes/`), **TanStack Query** for data fetching, **Chakra UI 3** for primitives, **TanStack Form** + Zod for forms, `@unpic/react` for images. Built via Vite.
- **CMS (`apps/cms-payload`)** — Next.js 16 hosting **Payload CMS 3.84** at `/admin`, with `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, and `@payloadcms/storage-s3` for media. Default dev port: `3001`.
- **Shared (`packages/database`)** — exports the Payload `config`, generated TypeScript types (`Report`, `Interview`, etc.), Lexical helpers, migrations / seed scripts, and the SMTP email adapter configuration used by `payload.sendEmail`. Both apps import from `@nature-urbaine/database`.
- **Shared (`packages/emails`)** — exports React Email templates and typed render helpers (`renderContactEmail`) used by website server functions. Local preview runs via `pnpm --filter @nature-urbaine/emails email:dev` on port `4000`.
- **Tooling** — `pnpm@10`, `turbo`, `oxlint`, `oxfmt`, `lefthook`. Migrations and seeding flow through root scripts (`pnpm migrate`, `pnpm seed:dev`, etc.).

The website talks to the database via **TanStack Start server functions** (`apps/website/src/server/*.ts`) that reach into Payload via the shared config — there is no public REST API to the website from the CMS.

## 3. Glossary

When writing code, prompts, ADRs, or copy, **use these exact terms** in their column. The French label is the user-facing one; the code term is what appears in collections, types, and route files.

| Domain concept (FR)                      | Code term (EN)                           | Notes / Don't say                                                                                                                                                                                                                                     |
| ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reportage photo                          | `Report` (collection slug `reports`)     | Core fact-sheet about a project. Do **not** call it `project` in code — `projectName` / `projectDetails` are sub-fields of a Report.                                                                                                                  |
| Interview / À la une / À la rencontre de | `Interview` (slug `interviews`)          | Q&A article about the people behind a project. The "À la une" page is the interview index.                                                                                                                                                            |
| Photo                                    | `Picture` (slug `pictures`)              | A single tagged image attached to one Report. Spec calls these "miniatures" / "images" — keep `Picture` in code.                                                                                                                                      |
| Catégorie de reportage                   | `Category` (slug `categories`)           | The 12 fixed categories (see §5). Used to tag a Report and to color/filter everywhere.                                                                                                                                                                |
| Étiquette / Mot-clef                     | `Tag` (slug `tags`)                      | A single keyword attached to a Picture. Hierarchical: tags can have a `parentId` tag (3 strata, e.g. `VOIRIE › BORDURE › BORDURE-A1`).                                                                                                                |
| Catégorie d'étiquette                    | `TagCategory` (slug `tag-categories`)    | Top grouping for tags. The spec mentions vegetation strata too (e.g. `ARBRE / CONIFÈRE / ARBUSTE`) — these are TagCategories.                                                                                                                         |
| Vignette                                 | `thumbnail` (Report field)               | Hero image of a Report card. Stored as a `Media` upload.                                                                                                                                                                                              |
| Maître d'ouvrage                         | `projectOwner`                           | The commissioning party.                                                                                                                                                                                                                              |
| Maître d'œuvre                           | `projectManagement`                      | The delivery / design lead. **Note:** in `Interview.ts` the `projectOwner` and `projectManagement` labels are swapped relative to `Report.ts` — this is a known quirk; treat the Report collection as canonical.                                      |
| Localisation                             | `locationDetails` (group field)          | Sub-fields: `country`, `city`, `postalCode`, `address`, `departmentCode`, `department`, `region`, `cityStratum`, `nbPopulations`.                                                                                                                     |
| Détails du projet                        | `projectDetails` (group field on Report) | Sub-fields: `photoAuthor`, `wordpressPostId`, `projectOwner`, `projectManagement`, `deliveryYear`, `projectCost`, `projectArea`.                                                                                                                      |
| Saison                                   | `season`                                 | Auto-derived virtual field on Report from `date`. Values: `spring`, `summer`, `autumn`, `winter`. Not user-editable.                                                                                                                                  |
| Strate (taxonomie)                       | `Tag` parent chain                       | Three levels: TagCategory → Tag (level 1) → Tag (level 2) → Tag (leaf). Walk the `parentId` chain to traverse.                                                                                                                                        |
| Strate (population)                      | `cityStratum`                            | Demographic strata of the city (see `locationDetails`). Different concept; same word.                                                                                                                                                                 |
| Fournisseur                              | `Supplier`                               | Out of scope. No collection yet.                                                                                                                                                                                                                      |
| Contribution                             | `Submission` (slug `submissions`)        | A visitor's proposed reportage submitted via `/contribuer`. Persisted with a `status` workflow (`pending` / `accepted` / `rejected`); on accept, an `afterChange` hook creates a `Report` draft and sets `promoted` + `promotedReport`. See ADR-0001. |
| Carte                                    | `/carte` route                           | Satellite map of pin-located reportages, colored by Category. Currently a placeholder.                                                                                                                                                                |
| Lieux                                    | (not modeled yet)                        | A-Z list of locations is described in the spec but not implemented.                                                                                                                                                                                   |

## 4. Domain entities

Defined in `packages/database/src/collections/`. Field names below are the actual code identifiers.

### Report — `Report.ts` (slug `reports`)

The core unit. Drafts enabled (`versions.drafts.validate`). Admin title: `name`.

- Required: `thumbnail` (→ `media`), `name`, `description`, `category` (→ `categories`), `date`.
- Virtual / read-only: `slug` (computed from `name`), `season` (computed from `date`).
- Optional `projectName`.
- Group `locationDetails` (see Glossary).
- Group `projectDetails` (see Glossary).
- Join `relatedPictures` (← `pictures.report`, `hasMany`).

### Interview — `Interview.ts` (slug `interviews`)

All fields required. Admin title: `name`.

- `name`, `interviewee`, `intervieweeRole`, `city`, `department`, `area`, `projectOwner`, `projectManagement`, `summary`.
- Group `projectDetails` with three Lexical rich-text fields matching the three editorial questions from the cahier:
  - `objectives` — "Quels sont les objectifs principaux de cet aménagement en termes de qualité de vie ?"
  - `impacts` — "Quels impacts écologiques cet aménagement vise-t-il à minimiser ou améliorer ?"
  - `challenges` — "Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?"
- Sidebar: `realisedAt`, `publishedAt`.

The cahier specifies a **500-character summary** and **1500-character** answers per question. The CMS does not currently enforce these limits — track as an ADR if added.

### Picture — `Picture.ts` (slug `pictures`)

Upload-enabled (`mimeTypes: ['image/*']`), with a `thumbnail` 400×300 image size for admin previews.

- `alt` (required).
- `report` (→ `reports`, required) — owning reportage.
- `relatedTags` (→ `tags`, `hasMany`) — the keyword tags attached to **this individual photo**, per the spec ("Toutes les images doivent pouvoir être tagguées").

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

Upload collection used for Report thumbnails. Distinct from `pictures`, which is the per-reportage gallery.

### Users — `Users.ts` (slug `users`)

Email/password auth. CMS admin only.

### Relationships summary

```
Category ─1─⟶ N Report ─1─⟶ N Picture ─N─⟶ N Tag ─N─⟶ 1 TagCategory
                  │                                    │
                  └─1─⟶ Media (thumbnail)             └─0..1─⟶ Tag (parentId, self-ref)
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

The cahier des charges defines these top-level pages: **Accueil, À la une, Lieux, Carte, Reportages photo, Fournisseurs, Contributions, Contact**. The current website implementation in `apps/website/src/routes/` covers a subset:

| Spec section               | Implemented route              | Route file                               | Notes                                                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil                    | `/`                            | `routes/index.tsx`                       | Editorial home — hero, possibilities carousel, À la une preview, categories index.                                                                                                                                                                                                 |
| À la une                   | `/interviews`                  | `routes/interviews/index.tsx`            | Interviews list; latest stacks on top per spec.                                                                                                                                                                                                                                    |
| À la une — détail          | `/interviews/$id`              | `routes/interviews/$id.tsx`              | Full interview with the 3 Q&A blocks; spec wants prev/next at footer ("articles précédents et suivants").                                                                                                                                                                          |
| Reportages photo (catalog) | `/reports`                     | `routes/reports/index.tsx`               | Catalog with filters: category (multi), city, free-text search. Pagination at 15/page.                                                                                                                                                                                             |
| Reportages — détail        | `/reports/$id`                 | `routes/reports/$id.tsx`                 | Single reportage page (thumbnail, fact-sheet, Picture gallery).                                                                                                                                                                                                                    |
| Filter by city / etc.      | `/reports/field/$field/$value` | `routes/reports/field/$field/$value.tsx` | Generic field-based filter (e.g. `/reports/field/city/Saint-Denis`).                                                                                                                                                                                                               |
| Filter by Category or Tag  | `/reports/entity/$kind/$id`    | `routes/reports/entity/$kind/$id.tsx`    | `$kind ∈ {category, tag}` (see `server/entity-search/kinds.ts`).                                                                                                                                                                                                                   |
| Carte                      | `/carte`                       | `routes/carte.tsx`                       | Placeholder; spec calls for satellite map with category-colored pins linking to reportages.                                                                                                                                                                                        |
| Contributions              | `/contribuer`                  | `routes/contribuer.tsx`                  | Submitter-friendly subset of the spec form: `name, description, category, deliveryYear, address (BAN-autocomplete), pictures (1–5), contributorEmail`. Persisted to `Submission` with moderation workflow + accept hook. See ADR-0001.                                             |
| Contact                    | `/contact`                     | `routes/contact.tsx`                     | Spec form: `firstName, lastName, email, sector (select), message`. One generic inbound channel, no topic picker. Sends operator notification email through `payload.sendEmail` (Payload Nodemailer adapter over SMTP) using templates from `@nature-urbaine/emails`. See ADR-0001. |
| Lieux                      | —                              | —                                        | Not implemented. Spec wants alphabetical reportages-by-location, FR first then étranger.                                                                                                                                                                                           |
| Fournisseurs               | —                              | —                                        | Not implemented.                                                                                                                                                                                                                                                                   |

URL convention: keep the French slug `/contribuer` but the code-side resource lives under `reports` / `interviews` (English plurals matching collection slugs). When adding new routes, prefer the collection slug (English) for `/reports`-like resources and the spec slug (French) for spec-only pages (`/lieux`, `/fournisseurs`).

## 7. Server functions (the website's data layer)

Lives in `apps/website/src/server/`. All built with `createServerFn` from `@tanstack/react-start`, gated by a `baseProcedure` middleware that boots a Payload local instance (`server/db.ts`). The Payload local API is the **only** way the website reads data — no HTTP roundtrip to the CMS.

| File                     | Exports                                                                                                           | Purpose                                                                                                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db.ts`                  | `baseProcedure`                                                                                                   | Middleware that puts a Payload instance on `context`.                                                                                                                                                                                                             |
| `report-catalog.ts`      | `findReportCatalog`, `findReportById`, `reportCatalogFilterSchema`, `REPORT_CATALOG_PAGE_SIZE`, `AugmentedReport` | Single seam for filtered, paginated Report listings — used by `/reports`, `/reports/entity/category/:id`, `/reports/field/city/:value`, and the home page. Owns the filter shape (`category`, `city`, free-text), default sort/depth, and the page-size constant. |
| `interviews.ts`          | `getInterviews`, `getInterviewById`                                                                               | Paginated list + detail; converts Lexical rich-text to HTML for `objectives`, `impacts`, `challenges`.                                                                                                                                                            |
| `categories.ts`          | `getAllCategories`, `getLibraryStats`, `getCategoryById`                                                          | The 12 categories + denormalized counts for the home grid.                                                                                                                                                                                                        |
| `tags.ts`                | `getTagById`, `getPicturesByTag`                                                                                  | Tag detail + paginated pictures tagged with it (recursive across child tags is the spec — verify).                                                                                                                                                                |
| `entity-search/kinds.ts` | `kinds` enum                                                                                                      | `['category', 'tag']` — the two values accepted by `/reports/entity/$kind/$id`.                                                                                                                                                                                   |
| `search.ts`              | (cross-entity search)                                                                                             | Spec wants header search across reportage title, description, city, MOA/MOE, photo tags, interview title, interviewee. Verify scope before relying on it.                                                                                                         |
| `tools.ts`               | `fetchOrReturnRealValue`                                                                                          | Helper that resolves either an id or an embedded doc via the Payload local API. Pattern used everywhere relations are augmented.                                                                                                                                  |

When adding a new server function:

1. Co-locate it under `src/server/` matching the collection.
2. Validate input with Zod via `inputValidator`.
3. Use `baseProcedure` for DB access.
4. Augment outputs with `fetchOrReturnRealValue` rather than depending on `depth` from Payload.

## 7b. Query layer (`src/queries/`)

A canonical **query layer** lives at `apps/website/src/queries/`, one file per entity. This layer owns all `queryOptions` factories and normalises errors into a typed shape before they reach the UI.

**Rule:** route files and components never define `queryOptions` inline. They always import from `@/queries/*`. The `server/` files only export `createServerFn` definitions — never `queryOptions`.

| File                | Exports                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `report-catalog.ts` | `reportCatalogQueryOptions`, `reportByIdQueryOptions` (re-exports `REPORT_CATALOG_PAGE_SIZE`, `reportCatalogFilterSchema`) |
| `interviews.ts`     | `interviewsQueryOptions`, `interviewByIdQueryOptions`                                                                      |
| `categories.ts`     | `categoriesQueryOptions`, `categoryByIdQueryOptions`, `libraryStatsQueryOptions`                                           |
| `tags.ts`           | `tagByIdQueryOptions`, `picturesByTagQueryOptions`                                                                         |
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
- **Styling:** Chakra UI primitives + design-system CSS variables. Avoid raw inline styles.
- **Forms:** TanStack Form + Zod. Re-use `useAppForm` from `apps/website/src/hooks/form-context.ts`.
- **Migrations:** never hand-edit DB; use `pnpm migrate:create` then `pnpm migrate`.
- **Seeds:** keep in `packages/database` and runnable in both `seed:dev` and `seed:prod`.
- **ADRs:** when an ambiguity in the cahier is resolved, write `docs/adr/NNNN-<slug>.md` so the decision survives. Reference contradicted ADRs explicitly per `docs/agents/domain.md`.
- **JSX structure comments:** do **not** use `{/* Section label */}` comments to describe or name blocks of JSX (e.g. `{/* Hero */}`, `{/* Sidebar */}`, `{/* Nav links */}`). JSX structure should be self-evident from component names and props. The only permitted `{/* … */}` comments are those documenting non-obvious behaviour (e.g. security mechanisms like a honeypot field).
- **Blank lines between JSX blocks:** do **not** use blank lines to visually separate sibling JSX elements or component groups. Rely on component decomposition and indentation for structure instead.

## 12. Open questions

Track in `docs/adr/` as they're answered.

- ~~Should `Submission` (Contribuer form persistence) live as a Payload collection with workflow states (`pending` / `accepted` / `rejected`), or be sent by email only?~~ **Resolved by ADR-0001** — Payload collection with workflow states and `afterChange` accept hook.
- The cahier wants per-photo right-click save behind email gating + a connection log. What schema models the log, and who consumes it?
- The label swap between `Report.projectOwner` / `projectManagement` (correct) and `Interview.projectOwner` / `projectManagement` (swapped) needs a one-line migration or a documented intent.
- Tag autocomplete + recursive descendant search: is this implemented in `server/search.ts`, or only at the SQL level? Confirm before extending.
- Carte page: target tile provider — Mapbox or MapLibre? Pricing and self-hosting trade-off should be an ADR.
- Categories table currently keys by numeric id; the design system keys by short string code (`agri`, `berges`, …). How is the mapping seeded and kept in sync?
