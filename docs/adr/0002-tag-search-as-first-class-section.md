# Tag search is its own section under `/tags`, with recursive descendant matching done at the application layer

Tag search is split out of the generic `/reports/entity/$kind/$id` route into a dedicated `/tags` picker + `/tags/$id` grid pair, the global search typeahead is narrowed to tags only (categories and locations become filters on `/reports`), and the spec-mandated recursive descendant matching is implemented as an application-level `parentId` walk rather than a closure table or a recursive SQL CTE.

## Status

accepted — 2026-05-24

## Context

Going into this decision, search was a single typeahead component (`SearchCombobox`) that returned three result kinds — `category`, `tag`, `location` — and routed all of them through one generic route, `/reports/entity/$kind/$id`, with a sibling generic route `/reports/field/$field/$value` for free-field filters like city. The same surface tried to be (a) a global search, (b) a category index, (c) a tag picker, and (d) a city filter. Each user persona only wanted one of those four at a time, so the flow asked everyone to mentally disambiguate between modes the system itself didn't separate.

CONTEXT.md §1 frames this project as a catalog of urban-landscape projects where each Picture is tagged with one or more `Tag` entries drawn from a hierarchical taxonomy that will reach ~2000 keywords (CONTEXT.md §8, §10). The cahier des charges is specific about tag search behaviour: case-insensitive, type-ahead with autocomplete, and **recursive** — searching `BORDURE` returns photos tagged with any descendant (`BORDURE-A1`, `BORDURE-ARASÉE`, …). Today's `getPicturesByTag` does an exact-match `relatedTags: { in: [tagId] }` and `getSearchResults` filters out non-leaf tags, so clicking a parent tag would land on an empty grid — the spec's primary tag-search behaviour is unimplemented.

Categories are a fixed list of 12 (CONTEXT.md §5) that already work as a filter on `/reports` (multi-select category filter exists in `routes/reports/index.tsx`). Cities are a free-text sub-field of `locationDetails` that the global search already queries; the redundant landing route `/reports/field/city/$value` does the same job that a `?city=` filter on `/reports` does.

CONTEXT.md §12 had this as an open question: _"Tag autocomplete + recursive descendant search: is this implemented in `server/search.ts`, or only at the SQL level?"_ — neither, today. This ADR resolves it.

## Decision

### Route topology

- New `/tags` route — picker page. Chakra `Combobox` for type-ahead search, Chakra `TreeView` underneath for browsing the taxonomy. URL state via TanStack Router native `validateSearch` carrying `?q=<text>`.
- New `/tags/$id` route — picture-grid page for a given tag. Replaces `/reports/entity/tag/$id`.
- `/reports/entity/$kind/$id` is **retired entirely**. The category branch folds into `/reports?category=:id`, the tag branch into `/tags/:id`. No redirect — the old URL 404s.
- `/reports/field/$field/$value` is **retired entirely**. The city branch folds into `/reports?city=:value`. No redirect — the old URL 404s.

### Global typeahead, narrowed

The shared `SearchCombobox` lives in two places — the home hero (inline, `size="lg"`) and the navbar (icon-button triggers a `Popover` containing the same component). It returns only tag suggestions, including non-leaves. Suggestion click → `/tags/:id`. Enter (or empty Enter) → `/tags?q=<text>` (or `/tags` with no query). Category and location result kinds are dropped from `getSearchResults`.

### Picker page (`/tags`)

- Empty state: `TreeView` shows TagCategories collapsed at the root. Children load lazily via a new `getChildTags(parentId)` server fn — one Payload `find` per expansion, depth 0.
- Search-active state (`?q=` non-empty): the tree collapses and a flat result list takes its place, with parent-chain hints (`VOIRIE › BORDURE › BORDURE-A1`).
- Non-leaf tags are clickable. Clicking any tag (leaf or non-leaf) routes to `/tags/:id`.

### Grid page (`/tags/$id`) — recursive descendant matching

On load, walk the `parentId` chain **downward** from the requested tag via repeated `find({ collection: 'tags', where: { parentId: { in: currentLevelIds } } })`. BFS: start with `[tagId]`, fetch its direct children, collect their ids, fetch their children, repeat until no more children. Then query pictures with `relatedTags: { in: [tagId, ...allDescendants] }`.

At the spec's three strata and ~2000 total tags, the walk is at most three round trips per request and each `in:` query is bounded by a manageable id set. Server function: `getPicturesByTagRecursive(tagId)` — replaces the existing `getPicturesByTag` (or is added alongside and the old one removed).

### Migration trigger to a heavier solution

This implementation is intentionally the simplest thing that satisfies the spec. The trigger to migrate is either of:

- p95 latency on `/tags/$id` data load > 200 ms, **or**
- descendant set size for any single tag query > 500.

When either is hit, migrate to a materialised closure table (option (ii) in _Considered alternatives_). The migration is a new collection-or-table plus `afterChange` hooks on `Tag` and a one-line change in `getPicturesByTagRecursive` — the call site does not move.

## Considered alternatives

- **(i) Keep the generic `/reports/entity/$kind/$id` and `/reports/field/$field/$value` routes** and just narrow the typeahead — rejected. Carries the persona-confusion problem forward and leaves dead code (one of the two `$kind` values, one of the N `$field` values).
- **(ii) Materialised closure table.** A `tag_descendants` (ancestor_id, descendant_id) table populated by hooks on `Tag` create / update / move. One join, fast at any scale. Real schema change, migration, and hooks needed — bigger upfront lift. Rejected **for now** with explicit migration triggers documented above.
- **(iii) Postgres recursive CTE via `payload.db.drizzle`.** One query, no schema change. Rejected because it breaks the "Payload local API is the only way the website reads data" pattern documented in CONTEXT.md §2 and §7, and because the perf headroom of (i) at this catalog size doesn't justify dropping out of the abstraction.
- **(iv) Punt the recursive behaviour entirely** — keep exact-match `relatedTags: { in: [tagId] }`, accept that non-leaf tags return empty grids until later. Rejected because (a) non-leaves are clickable in the new picker, so empty grids would be the user's expected outcome of a normal click — a UX regression; (b) the spec is explicit.
- **(v) Single fused page** with a left rail of tag suggestions and a right pane of pictures — rejected. Two URLs (picker, grid) is more shareable and matches the persona-first flow: paysagistes either know the tag (deep link to `/tags/:id`) or they don't (land on `/tags` to browse).

## Consequences

- The `/reports/entity` and `/reports/field` directories disappear, along with `server/entity-search/`. The `content/entity-search.ts` file shrinks to the tag-specific copy that survived. Callers that linked to these routes (home `LibraryStats`, category cards, etc.) need updating. Any external links to the old URLs will 404 — acceptable because the only known callers were inside the app and have been updated; if traffic to the old paths appears in logs later, a redirect can be reintroduced as a localised follow-up without revisiting this ADR.
- `PictureCard` is now used only on `/tags/$id`. It can be refactored picture-first without worrying about cross-page reuse. Tag chips and the report link live in the lightbox.
- `getSearchResults` becomes tag-only. Two of its three result kinds disappear, and the leaf-only filter is reversed (non-leaves are returned and clickable).
- `getPicturesByTagRecursive` does up to 4 round trips at three strata. This is acceptable at MVP scale but is the load-bearing call on the most-visited search surface — instrument it from day one (logged duration + descendant count) so the migration triggers above are observable.
- Closure-table migration, when it happens, is a strictly local change to `getPicturesByTagRecursive` and an additive schema migration. Call sites do not move.
- `region` filter on `/reports` is **not** introduced by this ADR. `region` is free-text in `locationDetails`, data quality is unknown, and the existing `city` filter (folded in from the retired `field` route) covers the persona's primary "where" question. A future ADR can revisit if data warrants.
