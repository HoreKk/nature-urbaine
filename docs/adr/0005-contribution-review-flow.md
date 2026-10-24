# A Contribution is a frozen record plus a photo archive, turned into a Report by an explicit admin action

`/contribuer` creates a `Contribution`: the reportage fields, the Contributeur (the photographer: name, email, consent) and one zip of their photos. No `Report` and no `Picture` exists until the operator clicks **Valider**, which creates a draft Report from the Contribution and opens it. The operator chooses, renames and uploads the photos into that Report through the normal gallery, then publishes it. **Refuser** sends the Contributeur a reason and deletes the archive. Supersedes the `/contribuer` part of ADR-0001.

## Status

accepted — 2026-10-24

## Context

The client asked for the contribution form to be "quasi le même formulaire" as the reportage fiche they fill in the admin, with up to 50 photos instead of 5, and only five required fields: project name, category, photos, photo author name and photo author email. There is no production data in `submissions`, so the ADR-0001 design could be challenged freely. Three things about the existing build forced a rethink:

- The ADR-0001 accept hook (`promoted`, `promotedReport`) and the rejection email were never built.
- Photos travelled as base64 JSON in one server function call: 50 photos at 5 MB is about 333 MB in one request.
- Never-published draft Reports are returned by the website's `find` calls (they run with `overrideAccess: true` and no `_status` filter), so any flow that creates a draft Report early leaks it publicly.

## Decision

### The form

Fields, in order: titre du projet\*, description, catégorie\*, maître d'ouvrage, maître d'œuvre, année de livraison, coût, superficie, adresse (BAN autocomplete, free text accepted when nothing matches), photos\* (1–50), auteur des photographies\* (name), email de l'auteur\*, and a required checkbox certifying authorship and authorising publication with the author's name. The Contact cross-link is removed from `/contribuer` (it stays on `/contact`). The page copy becomes « Notre équipe mettra en ligne vos photographies. »

The title is stored as typed and becomes the Report's `projectName`; the operator splits out the city during review, because `Report.name` is computed from city + `projectName`.

### Photos: one zip, built in the browser, uploaded straight to the bucket

The browser reads each photo's EXIF date, downscales it to a 2560 px long edge (the site never shows more than the 2048 px `large` variant), and zips them without recompression. A server function validates the fields, the honeypot and the rate limit, then returns presigned upload instructions (`getUploadInstructions` with `overrideAccess`). The browser PUTs the zip to the bucket. A second server function fetches the zip and checks it: at most 50 entries, each an image by its file signature, and a cap on total unpacked size. Only then does it create the `Contribution` and email the operator. A daily sweep deletes archive objects that never got a Contribution.

The zip lives in a private upload collection, `contribution-archives` (zip only, no variants, logged-in read), listed in `storage-collections.ts`. The Contribution's `archive` field points to it.

### Lifecycle

`status` is read-only in the admin and only changes through these transitions:

| From       | Action                  | To          | Effect                                                                                                                                                   |
| ---------- | ----------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pending`  | **Valider**             | `accepted`  | Creates the draft Report from the Contribution's fields (`photoAuthor` = author name, `date` = EXIF date or submission date), links it, redirects to it. |
| `pending`  | **Refuser** (note)      | `rejected`  | Emails the note to the Contributeur, deletes the archive.                                                                                                |
| `accepted` | **Refuser** (note)      | `rejected`  | Allowed while the Report was never published; also deletes the draft Report.                                                                             |
| `accepted` | first publish of Report | `published` | A Report hook emails the Contributeur « vos photos sont en ligne » with the link.                                                                        |

Valider and Refuser are buttons in the edit view's controls row, next to « Sauvegarder », shown only when the transition is allowed. Each opens a modal explaining what happens; Refuser's modal holds the required `rejectionNote`.

The Contribution's fields are editable while `pending` (to fix typos before Valider) and frozen once `accepted` or `rejected`. `archive` and the consent date are always read-only. The archive is kept after publication, as proof of the photos' origin tied to the consent.

### Admin

- The Report sidebar shows a read-only Contribution panel when the Report came from one: the author's email, the zip download, and a link to the Contribution.
- The Contributions list has no forced filter: newest first, columns title, category, author, status, date.
- A dashboard widget shows the queue: counts per status (to process, validated but not yet published, published, refused), the age of the oldest pending Contribution, and the latest pending ones with links.
- The admin sidebar is grouped: **Contributions** (Contributions, Archives de contributions), **Contenu** (Reportages, Interviews), **Médias** (Photos de reportage, Photos d'interview, Médias), **Classement** (Catégories, Étiquettes, Catégories d'étiquettes), **Réglages** (Formulaires, Utilisateurs).

### Emails

To the operator on each new Contribution (fields and an admin link, no attachment). To the Contributeur on publication and on refusal, sent from `EMAIL_FROM` with reply-to set to the operator address. No receipt on submit: the on-screen confirmation is enough.

### Report changes

`Report` drafts stop validating (`versions.drafts.validate` off), so a Report created by Valider without a description saves; `description` stays required to publish. Unpublished Reports and their Pictures are hidden by real collection access rules instead of `overrideAccess` (done separately, before this work).

## Considered alternatives

- **Staging copy with an accept hook (ADR-0001).** Same Contribution record, but the hook re-uploaded the submitted photos into `pictures`. With 50 photos most of which the operator discards or renames, copying them all is wasted work, and the review happened in two places.
- **The form creates the draft Report directly, with a slim Contribution envelope.** One home for the content, but every spam or refused contribution writes to `reports`, and refusing means deleting a Report. It was the right call while photos became `Picture`s on submit; the zip removed that reason.
- **Photos as `Picture` or `Media` rows on submit.** Puts untrusted uploads in public collections and asks the operator to clean up in the admin what they would rather sort on their own machine.
- **One `FormData` server function call for the zip.** Simpler, but TanStack Start buffers the whole body in memory with no cap.
- **Presigned upload per photo, or a server-built zip.** More requests and server work for no gain once photos are downscaled.

## Consequences

- The Contribution reuses Report's field definitions (shared builders for the `projectDetails` and `locationDetails` groups) so the two cannot drift.
- Photos reach the website only through the operator's own uploads into the Report gallery: nothing from `/contribuer` is ever public before review.
- Refused Contributions keep their row (fields, author, note) for audit, without photos.
- A future account system can attach Contributions by `authorEmail`; the public credit stays the `photoAuthor` text.
