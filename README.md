# Nature Urbaine

> La plateforme collaborative dédiée aux professionnels de l'aménagement des espaces extérieurs.

A public French-language platform for urban-landscape professionals (paysagistes, maîtres d'ouvrage, maîtres d'œuvre, urbanistes). It is a growing catalog of urban-landscape project photo reports ("reportages photos") enriched by interviews with the people behind them.

---

## Architecture

One TanStack Start app serves the public site, the Payload admin (`/admin`) and Payload's REST API (`/api`), built with Vite and served by Nitro. It lives in a `pnpm` workspace next to the shared database and email packages. PostgreSQL is the single backing store; uploads go to the Railway bucket.

```
nature-urbaine/
├── apps/
│   └── website/          ← Site + Payload admin + API (TanStack Start, port 3000)
├── packages/
│   ├── database/         ← @nature-urbaine/database — Payload config,
│   │                        collections, types, migrations, seeds
│   └── emails/           ← @nature-urbaine/emails — react-email templates
├── docs/
│   ├── adr/              ← Architecture Decision Records
│   └── agents/           ← Agent usage guidelines
├── GLOSSARY.md           ← Single source of domain truth
└── docker-compose.yaml   ← Dev PostgreSQL
```

### Data flow

```
                    ┌─────────────────────────────────┐
                    │         PostgreSQL :5434         │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   @nature-urbaine/database       │
                    │   (Payload config + collections) │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  apps/website  :3000             │
                    │  /          site (SSR)           │
                    │  /admin     Payload admin (RSC)  │
                    │  /api       Payload REST         │
                    └─────────────────────────────────┘
```

The website uses **TanStack Start server functions** (`apps/website/src/server/*.ts`) that call Payload's local API directly, in the same process as the admin. Every local API call passes `overrideAccess: true` (Payload 4 defaults it to `false`).

---

## Stack

| Layer                | Technology                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Public website       | React 19, TanStack Start (SSR), TanStack Router (file-based), TanStack Query, TanStack Form + Zod   |
| UI                   | Chakra UI 3, `@unpic/react` for images                                                              |
| Fonts                | Newsreader (headlines), Instrument Sans (body), JetBrains Mono (slugs/dates)                        |
| CMS                  | Payload 4 (beta), `@payloadcms/tanstack-start`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3` |
| Server               | Vite 8 + `@vitejs/plugin-rsc`, Nitro (`node .output/server/index.mjs`), Node 24                     |
| Database             | PostgreSQL 16                                                                                       |
| Shared package       | `@nature-urbaine/database` — collections, migrations, seeds, generated types                        |
| Workspace            | pnpm 10                                                                                             |
| Linting / Formatting | oxlint, oxfmt, lefthook (pre-commit)                                                                |

---

## Domain Model

```
Category ─1─⟶ N Report ─1─⟶ N Picture ─N─⟶ N Tag ─N─⟶ 1 TagCategory
                  │                                    │
                  └─1─⟶ Media (thumbnail)             └─0..1─⟶ Tag (parentId, self-ref)
```

| Collection    | Slug             | Description                                                         |
| ------------- | ---------------- | ------------------------------------------------------------------- |
| `Report`      | `reports`        | Core fact-sheet for an urban-landscape project ("reportage photo")  |
| `Interview`   | `interviews`     | Q&A article with professionals ("À la une")                         |
| `Picture`     | `pictures`       | Single tagged image belonging to one Report                         |
| `Category`    | `categories`     | 12 fixed project categories                                         |
| `Tag`         | `tags`           | Hierarchical keyword attached to a Picture (3 strata)               |
| `TagCategory` | `tag-categories` | Top-level grouping for tags                                         |
| `Media`       | `media`          | Report thumbnail uploads                                            |
| `Submission`  | `submissions`    | Visitor-submitted reportage proposals (pending → accepted/rejected) |
| `Users`       | `users`          | CMS admin users (email/password)                                    |

---

## Routes

| Route                          | Description                                                      |
| ------------------------------ | ---------------------------------------------------------------- |
| `/`                            | Home — hero, categories grid, interview previews                 |
| `/interviews`                  | Interview list ("À la une")                                      |
| `/interviews/$id`              | Interview detail with 3 Q&A blocks                               |
| `/reports`                     | Report catalog with filters (category, city, free-text), 15/page |
| `/reports/$id`                 | Report detail — fact-sheet + picture gallery                     |
| `/reports/field/$field/$value` | Field-based filter (e.g. `/reports/field/city/Lyon`)             |
| `/reports/entity/$kind/$id`    | Filter by category or tag                                        |
| `/carte`                       | Map — satellite pins colored by category _(placeholder)_         |
| `/contribuer`                  | Visitor contribution form → `Submission` workflow                |
| `/contact`                     | Contact form                                                     |

---

## Local Development

### Prerequisites

- Node.js 24 (≥ 24.15, required by Payload 4)
- pnpm 10 (`npm i -g pnpm@10`)
- Docker (for the dev database)

### Setup

```bash
# 1. Clone and install
git clone <repo-url> nature-urbaine
cd nature-urbaine
pnpm install

# 2. Start PostgreSQL, maildev and the RustFS object store
docker compose up -d

# 3. Copy and fill environment variables
cp apps/website/.env.example apps/website/.env

# 4. Run migrations
pnpm migrate

# 5. Seed development data
pnpm seed:dev

# 6. Start the app
pnpm dev:website       # site http://localhost:3000, admin http://localhost:3000/admin
```

### Environment variables

**`apps/website/.env`** (see `.env.example` for the email and bucket variables)

```env
PAYLOAD_SECRET=<random-string>
DATABASE_URL="postgresql://postgres:password@localhost:5434/nature-urbaine"
```

Uploads go to the local RustFS object store (S3 API on `:9100`, console on `:9101`, bucket `nature-urbaine` created by `docker compose up`), so dev takes the same path as the Railway bucket. The `S3_*` values are in `.env.example`. Leave them empty to write uploads to `apps/website/media` and `apps/website/pictures` instead.

---

## Scripts

### Development

| Command            | Description                                       |
| ------------------ | ------------------------------------------------- |
| `pnpm dev:website` | Start the site, admin and API (port 3000)         |
| `pnpm build`       | Production build (`payload build` → `.output/`)   |
| `pnpm start`       | Serve the production build with Node, no wrappers |

### Database

| Command                              | Description                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `pnpm migrate`                       | Run pending migrations                                                                        |
| `pnpm migrate:create`                | Generate a new migration from schema changes                                                  |
| `pnpm migrate:status`                | Show migration status                                                                         |
| `pnpm migrate:down`                  | Roll back last migration                                                                      |
| `pnpm migrate:refresh`               | Roll back and re-run all migrations                                                           |
| `pnpm migrate:reset`                 | Reset the database                                                                            |
| `pnpm migrate:fresh`                 | Drop all tables and re-run from scratch                                                       |
| `pnpm seed:dev`                      | Drop and re-seed development data                                                             |
| `pnpm seed:prod`                     | Seed production data (non-destructive)                                                        |
| `pnpm storage:check`                 | Read-only: every upload row has its object in the bucket                                      |
| `pnpm storage:fixtures`              | Dev only: add one row per prod upload layout and write the objects to RustFS                  |
| `pnpm storage:fixtures:verify`       | Dev only: fetch every fixture image through the running app (`FIXTURES_BASE_URL`)             |
| `pnpm storage:fixtures:large-report` | Dev only: one report with 240 photos of 4000×3000 (`FIXTURE_COUNT`), uploaded through Payload |

### Code generation

| Command                   | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `pnpm generate:types`     | Regenerate `payload-types.ts` from the collection schema |
| `pnpm generate:importmap` | Regenerate Payload import map                            |
| `pnpm chakra:typegen`     | Regenerate Chakra UI type tokens                         |

### Quality

| Command       | Description                     |
| ------------- | ------------------------------- |
| `pnpm lint`   | Run oxlint across all packages  |
| `pnpm format` | Run oxfmt across all packages   |
| `pnpm check`  | Run both lint and format checks |

### Testing an upload-storage migration locally

`storage:fixtures` recreates every upload layout production has: `media` with an empty or `media` prefix, pictures with and without a thumbnail, NFD accents, apostrophes, commas and screenshot names, and `_objectKey` folders. It writes their objects to RustFS at the keys the current Payload version uses. To check a Payload upgrade end to end:

1. Build a DB on the old schema: run the old branch's `pnpm migrate` against an empty database.
2. `pnpm storage:fixtures` on it (with the `S3_*` RustFS variables set).
3. Switch branch, then run `pnpm migrate && pnpm storage:check`.
4. `pnpm build`, start the app, then run `pnpm storage:fixtures:verify` against it.

The script refuses any non-local bucket.

### Picture variants

Every `pictures` upload gets three variants (`packages/database/src/image-variants.ts`): a 400×300 `thumbnail` crop for cards and grids, and uncropped `medium` (1024 px wide) and `large` (2048 px wide) WebP files. The report banner, carousel and lightbox only use `medium`/`large` through `srcSet`; they fall back to the original only for a row without variants.

To reproduce a large report locally, `pnpm storage:fixtures:large-report` (with the RustFS `S3_*` variables set) creates « Reportage de test · 240 photos » (`FIXTURE_COUNT=5` for « … · 5 photos »).

---

## Deployment (Railway)

One Railway service builds from the repo root with Railpack (`packageManager` and `engines.node` in the root `package.json` pick pnpm 10 and Node 24).

| Setting            | Value                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Build command      | `pnpm build`                                                                                                                       |
| Start command      | `pnpm start` (runs `node` directly)                                                                                                |
| Pre-deploy command | `pnpm migrate && pnpm storage:check`                                                                                               |
| Healthcheck path   | `/`                                                                                                                                |
| Variables          | `PAYLOAD_SECRET`, `DATABASE_URL`, the `S3_*` bucket references, SMTP and contact email variables (see `apps/website/.env.example`) |

Without `S3_*` on Railway the app refuses to boot (`packages/database/src/storage.ts`), so uploads can't land on the container disk. `railway.json` is deprecated by Railway, so these settings live in the service settings, not in the repo.

---

## Conventions

- **Language:** code identifiers in English (`reports`, `interviews`); user-facing labels and CMS field labels in French.
- **Routing:** add new routes under `apps/website/src/app/` (Payload's convention) — TanStack Router auto-generates `routeTree.gen.ts`. `src/app/_payload/` holds the admin and API routes.
- **Styling:** Chakra UI primitives + design-system CSS variables. No raw inline styles.
- **Forms:** TanStack Form + Zod. Re-use `useAppForm` from `apps/website/src/hooks/form-context.ts`.
- **Server functions:** co-locate under `apps/website/src/server/`, validate inputs with Zod via `.validator()`, use `baseProcedure` for DB access.
- **Migrations:** never hand-edit the database directly — use `pnpm migrate:create` then `pnpm migrate`.
- **ADRs:** when a spec ambiguity is resolved, write `docs/adr/NNNN-<slug>.md`.
- **Pre-commit hooks** (lefthook): `oxfmt` and `oxlint --fix` run automatically on staged files.

---

## Documentation

| File                                               | Purpose                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [`GLOSSARY.md`](./GLOSSARY.md)                     | Full domain model, glossary, routes, server functions, design notes |
| [`docs/adr/`](./docs/adr/)                         | Architecture Decision Records                                       |
| [`docs/agents/domain.md`](./docs/agents/domain.md) | Guidelines for AI agents working in this repo                       |
