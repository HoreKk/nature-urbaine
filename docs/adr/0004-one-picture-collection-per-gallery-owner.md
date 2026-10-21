# One photo collection per gallery owner, built from a shared factory

Reports and Interviews each own an ordered photo gallery with the same admin UI, the same website components and the same "first photo is the Vignette" rule. Each owner gets its own upload collection (`pictures` for Reports, `interview-pictures` for Interviews), both produced by `pictureCollection()` in `src/payload/collections/picture-collection.ts`, and both joined from their owner through a join named `relatedPictures`.

## Status

accepted — 2026-10-23

## Context

Issue [#12](https://github.com/HoreKk/nature-urbaine/issues/12) asks for Interview photo galleries "like Reports": ordered, editable in the Interview form, same carousel and lightbox. Reports use a `Picture` collection whose `report` relationship is required, listed from the Report through an `orderable` join (fractional indexing, drag-and-drop).

Two Payload 4 facts shaped the options:

- An `orderable` join stores its sort key as a hidden column on the **child** collection, named from the child slug and the join name only. Two owners joining the same child under the same name share one column and one scope, which breaks ordering for one of them. Two joins under different names work, at the price of asymmetric names (`relatedPictures` / `gallery`).
- A polymorphic relationship (`relationTo: [...]`) is stored in a `_rels` table, not an indexed column, and cannot be filtered by fields of the related document.

Production holds ~19.3k Report photos in `pictures`, keyed by `report_id`, and the pre-existing Interview `thumbnail` upload lives in `media`.

## Decision

- **One collection per owner.** `pictures` keeps its slug and rows; it is relabelled "Photos de reportage". `interview-pictures` is new. Each has a required owner relationship (`report`, `interview`) and the same upload settings, variants and admin navigation (`PictureNav`, which receives its owner from the factory's server props).
- **Same join on both owners.** `Report.relatedPictures` and `Interview.relatedPictures` are identical joins (`orderable`, `defaultLimit: 0`), so server functions, the admin and the glossary read the same way for both.
- **Interview photos are untagged.** Tag search covers Report photos only (ADR-0002); `relatedTags` stays specific to `pictures`.
- **Legacy thumbnails are copied, not re-pointed.** `storage:backfill:interview-media` creates an `InterviewPicture` from each Interview `thumbnail`, once, after the deploy. `thumbnail` stays as a hidden field until that has run, then a second migration drops it.
- **Every upload collection is listed once**, in `storage-collections.ts`: the storage prefix, the website's URL signing and `storage:check` all follow that list.

## Considered alternatives

- **One `Picture` with two nullable owners (`report`, `interview`).** Needs a hook to enforce exactly one owner (field validation is skipped when a conditional field is hidden), `report exists` filters in tag search, two-branch admin navigation, and a boundary type in every server function returning Pictures, because `Picture` then embeds Interview's Lexical types. Also forces the asymmetric join names. Built first, then replaced by this decision.
- **One `Picture` with a polymorphic `owner`.** One schema-guaranteed owner and symmetric join names, but all ownership moves to `pictures_rels` (a bulk migration of every Report photo), two orderable joins on one field is undocumented and generates a duplicate index, and photos could no longer be filtered through their owner's fields (for example a Report's draft status).
- **An ordered `media` upload list on Interview.** Simplest, and the thumbnail migration is plain SQL, but not the Report system: list queries cannot limit the join to the first photo, photos are not taggable, and removing one leaves an orphan `media` row.

## Consequences

- A third upload collection must be wired wherever uploads are enumerated: `storage-collections.ts`, the sharp transformer config, and the bucket prefix `interview-pictures/`. `storageCoverageGuard` refuses to start if the list is incomplete.
- `interview-pictures` photos appear in a separate admin list from Report photos. Editors manage both from the owner's form.
- Giving a third entity a gallery means a third collection from the same factory and a `relatedPictures` join on the owner, nothing else.
- Making Interview photos searchable later means adding `relatedTags` to `interview-pictures` and a second query in tag search, not a model change.
