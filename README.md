# Nature Urbaine

> La plateforme collaborative dédiée aux professionnels de l'aménagement des espaces extérieurs.

A public French-language platform for urban-landscape professionals (paysagistes, maîtres d'ouvrage, maîtres d'œuvre, urbanistes). It is a growing catalog of urban-landscape project photo reports ("reportages photos") enriched by interviews with the people behind them.

---

## Architecture

A `pnpm` + Turbo monorepo with two apps sharing one database package. PostgreSQL is the single backing store.

```
nature-urbaine/
├── apps/
│   ├── website/          ← Public site (Vite + TanStack Start, port 3000)
│   └── cms-payload/      ← Payload CMS admin (Next.js 16, port 3001)
├── packages/
│   └── database/         ← @nature-urbaine/database — Payload config,
│                            collections, types, migrations, seeds
├── docs/
│   ├── adr/              ← Architecture Decision Records
│   └── agents/           ← Agent usage guidelines
├── CONTEXT.md            ← Single source of domain truth
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
                    └───────┬─────────────────┬───────┘
                            │                 │
          ┌─────────────────▼───┐   ┌─────────▼────────────────┐
          │  apps/cms-payload   │   │      apps/website         │
          │  Payload admin UI   │   │  TanStack Start (SSR)     │
          │  Next.js :3001      │   │  server functions → local │
          └─────────────────────┘   │  Payload API  :3000       │
                                    └───────────────────────────┘
```

The website uses **TanStack Start server functions** (`apps/website/src/server/*.ts`) that call Payload's local API directly — there is no HTTP round-trip between the website and the CMS.

---

## Stack

| Layer                | Technology                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Public website       | React 19, TanStack Start (SSR), TanStack Router (file-based), TanStack Query, TanStack Form + Zod |
| UI                   | Chakra UI 3, `@unpic/react` for images                                                            |
| Fonts                | Newsreader (headlines), Instrument Sans (body), JetBrains Mono (slugs/dates)                      |
| CMS                  | Payload CMS 3.84, Next.js 16, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`                 |
| Database             | PostgreSQL 16                                                                                     |
| Shared package       | `@nature-urbaine/database` — collections, migrations, seeds, generated types                      |
| Monorepo             | pnpm 10 + Turbo                                                                                   |
| Linting / Formatting | oxlint, oxfmt, lefthook (pre-commit)                                                              |

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

- Node.js ≥ 20
- pnpm 10 (`npm i -g pnpm@10`)
- Docker (for the dev database)

### Setup

```bash
# 1. Clone and install
git clone <repo-url> nature-urbaine
cd nature-urbaine
pnpm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Copy and fill environment variables
cp apps/cms-payload/.env.example apps/cms-payload/.env
cp apps/website/.env.example     apps/website/.env

# 4. Run migrations
pnpm migrate

# 5. Seed development data
pnpm seed:dev

# 6. Start both apps
pnpm dev:cms-payload   # http://localhost:3001/admin
pnpm dev:website       # http://localhost:3000
```

### Environment variables

**`apps/cms-payload/.env`**

```env
PAYLOAD_SECRET=<random-string>
DATABASE_URL="postgresql://postgres:password@localhost:5434/nature-urbaine"
```

**`apps/website/.env`**

```env
PAYLOAD_SECRET=<same-random-string>
DATABASE_URL="postgresql://postgres:password@localhost:5434/nature-urbaine"
BACKEND_URL=http://localhost:3001
VITE_BACKEND_URL=http://localhost:3001
```

> Both apps share the same `PAYLOAD_SECRET` and `DATABASE_URL` because the website accesses the database via the Payload local API.

---

## Scripts

### Development

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm dev:cms-payload` | Start the Payload CMS admin (port 3001) |
| `pnpm dev:website`     | Start the public website (port 3000)    |

### Database

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `pnpm migrate`         | Run pending migrations                       |
| `pnpm migrate:create`  | Generate a new migration from schema changes |
| `pnpm migrate:status`  | Show migration status                        |
| `pnpm migrate:down`    | Roll back last migration                     |
| `pnpm migrate:refresh` | Roll back and re-run all migrations          |
| `pnpm migrate:reset`   | Reset the database                           |
| `pnpm migrate:fresh`   | Drop all tables and re-run from scratch      |
| `pnpm seed:dev`        | Drop and re-seed development data            |
| `pnpm seed:prod`       | Seed production data (non-destructive)       |

### Code generation

| Command                   | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `pnpm generate:types`     | Regenerate `payload-types.ts` from the collection schema |
| `pnpm generate:importmap` | Regenerate Payload import map                            |
| `pnpm chakra:typegen`     | Regenerate Chakra UI type tokens                         |

### Quality

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm lint`        | Run oxlint across all packages  |
| `pnpm format`      | Run oxfmt across all packages   |
| `pnpm check`       | Run both lint and format checks |
| `pnpm build:loose` | Build all apps (Turbo)          |

---

## Conventions

- **Language:** code identifiers in English (`reports`, `interviews`); user-facing labels and CMS field labels in French.
- **Routing:** add new routes under `apps/website/src/routes/` — TanStack Router auto-generates `routeTree.gen.ts`.
- **Styling:** Chakra UI primitives + design-system CSS variables. No raw inline styles.
- **Forms:** TanStack Form + Zod. Re-use `useAppForm` from `apps/website/src/hooks/form-context.ts`.
- **Server functions:** co-locate under `apps/website/src/server/`, validate inputs with Zod via `inputValidator`, use `baseProcedure` for DB access.
- **Migrations:** never hand-edit the database directly — use `pnpm migrate:create` then `pnpm migrate`.
- **ADRs:** when a spec ambiguity is resolved, write `docs/adr/NNNN-<slug>.md`.
- **Pre-commit hooks** (lefthook): `oxfmt` and `oxlint --fix` run automatically on staged files.

---

## Documentation

| File                                               | Purpose                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| [`CONTEXT.md`](./CONTEXT.md)                       | Full domain model, glossary, routes, server functions, design notes |
| [`docs/adr/`](./docs/adr/)                         | Architecture Decision Records                                       |
| [`docs/agents/domain.md`](./docs/agents/domain.md) | Guidelines for AI agents working in this repo                       |
