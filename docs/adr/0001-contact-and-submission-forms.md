# Contact and Submission are two separate forms, with `Submission` persisted as a Payload collection

`/contact` and `/contribuer` answer two different jobs-to-be-done — generic inbound vs. proposing a reportage — and the cahier des charges already separates them. We keep the two pages distinct, align `/contact` to the spec fields (no persistence, just a future email send), and persist `/contribuer` as a `Submission` Payload collection so that contributions become the operator's moderation queue inside `/admin` rather than email triage.

## Status

accepted — 2026-05-01

## Context

Going into this decision, `apps/website/src/routes/contact.tsx` was a confused hybrid (eyebrow `"Contact · Contribution"`, fields shaped like a contribution form) and `apps/website/src/routes/contribuer.tsx` was a placeholder. The cahier des charges describes them as two distinct top-level pages with different field sets, audiences, and downstream flows. CONTEXT.md §12 had this as an open question: should the contribution form persist to a collection or just send email.

Community contributions are not a side feature — CONTEXT.md §1 frames the project as a collaborative catalog where "each image and reference is a community contribution." Treating contributions as transactional emails undersells the core flywheel and loses photos to inbox attachments.

## Decision

### `/contact`

One generic inbound channel — no topic / kind picker. Operator routes from the message body. Spec fields, exactly:

```
firstName    (prénom, required)
lastName     (nom, required)
email        (required, validated)
sector       (secteur d'activité, required, select: paysagiste | MOA | MOE | urbaniste | autre)
message      (required, multiline)
```

No persistence — the form sends an email to the operator via `payload.sendEmail` (Payload Nodemailer adapter backed by SMTP). The contact email is rendered from `@nature-urbaine/emails` (React Email templates + plain-text fallback) and uses env-driven config (`TO_EMAIL`, `EMAIL_FROM`, with fallback to `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM`, plus `CONTACT_EMAIL_FROM_NAME`, `SMTP_*`). In local development, Maildev runs without auth (`localhost:1025`, `SMTP_SECURE=false`); production can use authenticated SMTP (for example Resend SMTP).

### `/contribuer`

Persisted as a new `Submission` Payload collection. Public form fields, in submit order:

```
name                  (project title, text, required)
description           (textarea, required, ≤500 ch)
category              (select 1-of-12, required)
deliveryYear          (number, required)
address               (BAN-autocomplete, required)
locationDetails       (auto-derived from BAN, hidden in form)
pictures              (Chakra <FileUpload />, 1–5 photos, standard size/mime defaults)
contributorEmail      (required, validated)
```

On successful submission, keep writing to `Submission` and also send an operator notification email rendered from `@nature-urbaine/emails` (same layout/design language as contact template) to the shared recipient config.

System / admin fields:

```
status                ('pending' | 'accepted' | 'rejected', default 'pending')
rejectionNote         (text, set when rejected)
promoted              (boolean, set true when the accept hook completes)
promotedReport        (relationship → reports, set when the accept hook completes)
```

### Geocoding

Address autocomplete uses [api-adresse.data.gouv.fr](https://api-adresse.data.gouv.fr) (BAN). Free, official, FR-only, no API key. Resolved fields (`city, postcode, department, region, citycode`) are stored alongside the typed address at submit time, not at promotion time.

### Promote-to-`Report` mechanic

A Payload `afterChange` hook on `Submission`: when `status` flips `pending → accepted` and `promoted` is false, the hook creates a `Report` draft pre-filled from submission fields, sets `promotedReport`, and sets `promoted = true`. The hook is idempotent (`if (promoted) return`).

Submission rows are kept after promotion (`status = 'accepted'`, `promoted = true`, `promotedReport` set) for audit. The default admin list view filters to `status = 'pending'` so the queue stays clean.

Photo handling on promotion is **deferred** — for now the operator manually creates `Picture` rows from the submitted media. The hook does not auto-create Pictures.

### Spam protection

- Honeypot field (hidden input that bots fill, server rejects when non-empty).
- IP-based rate limit (3 submissions / hour).

No CAPTCHA in v1. Add Cloudflare Turnstile only if these two layers are observed to fail.

### Cross-linking

One line below the page header on each form, linking to the other ("Vous souhaitez proposer un projet ? Contribuer." / "Une question ou une erreur à signaler ? Contact.").

### Contributor identity

Email only. No name fields on the public form. A future user-account system may revisit this — not in scope today.

### Notifications

Send: (a) operator notification on new submission, (b) contributor email on rejection (with `rejectionNote`). No acknowledgement email on acceptance — the published reportage is the acknowledgement.

## Considered alternatives

- **Merge into one form** — rejected. Different jobs, different fields, different downstream flows. The current `/contact` confusion is a code bug, not a real signal.
- **Email-only contributions** (no `Submission` collection) — rejected. Photos as inbox attachments, no moderation queue, no audit, no path to the spec's right-click-save-with-email-gate connection log (CONTEXT.md §10) which would reuse the same plumbing.
- **Custom admin "Promouvoir" button** instead of an `afterChange` hook — rejected for v1. Hooks are idiomatic Payload, no React drift on upgrades, low operator volume.
- **Topic/kind picker on `/contact`** — rejected. Volume doesn't justify the schema and the operator can route from the message body.

## Consequences

- A `Report` can now come into existence two ways (operator-typed or promoted from a Submission). The hook must be idempotent and the Submission row must clearly track its derived `Report` to avoid drift.
- `Picture` rows are not auto-created on promotion. A published reportage with no gallery is possible if the operator forgets — mitigated by keeping the promoted `Report` in draft until the operator publishes it explicitly.
- BAN autocomplete is FR-only. International contributions (the spec mentions "France first, then étranger") will fail address resolution and need a fallback path — out of scope today.
