# DESIGN.md — Defaults for Nature Urbaine UI

> Editorial, French, light-mode, image-forward platform for urban-landscape professionals. **Calm, sober, not "tech-startup-y".** When in doubt, choose the quieter option.
>
> **Source of truth, in this order:**
>
> 1. [`apps/website/src/utils/chakra-theme.ts`](apps/website/src/utils/chakra-theme.ts) — tokens, semantic tokens, fonts.
> 2. [`apps/website/src/utils/recipes/`](apps/website/src/utils/recipes/) — `button.ts`, `textStyles.ts`.
> 3. The design handoff in `/Users/horek/Downloads/design_handoff/` (`DESIGN_SYSTEM.md`, `PAGES.md`, `INTERACTIONS.md`) — editorial intent, page layouts, component behavior.
>
> If the theme and the handoff disagree on a token (e.g. accent color), **the theme wins** — the handoff describes original intent, the code is current truth.

---

## 1 · Hard rules (do not deviate)

- **Use Chakra v3** with the `system` exported from `apps/website/src/utils/chakra-theme.ts`. Never import other UI libs.
- **Never hardcode colors.** Use semantic tokens (`bg`, `bg.subtle`, `bg.muted`, `fg`, `fg.muted`, `fg.subtle`, `border`, `border.muted`, `primary.solid`, `primary.fg`, `primary.muted`, `primary.subtle`, `secondary.solid`, `paper.*`).
- **Never hardcode font sizes for editorial copy.** Use `textStyle="..."` (see §3).
- **Never introduce dark-mode variants.** Light mode only.
- **Never use emoji** in UI copy. Use `react-icons` (Lucide via `lu`, Remix via `ri`) with `currentColor`.
- **French copy**, complete sentences, no exclamation marks, no jargon. `<html lang="fr">`.
- **No page-load animations, no parallax, no scroll-triggered reveals.** Hover micro-interactions only.

---

## 2 · Semantic tokens — what to reach for

| Need                                 | Token                              |
| ------------------------------------ | ---------------------------------- |
| Page background                      | `bg` (= `paper.50`)                |
| Subtle alt surface (footer, info)    | `bg.subtle` (= `paper.100`)        |
| Stronger alt surface (placeholder)   | `bg.muted` (= `paper.200`)         |
| Primary text                         | `fg`                               |
| Secondary text, captions             | `fg.muted`                         |
| Tertiary text, mono labels, helpers  | `fg.subtle`                        |
| Default border (1px on inputs/cards) | `border`                           |
| List separator, lighter rule         | `border.muted`                     |
| Primary accent fill (CTA, link, dot) | `primary.solid`                    |
| Text on primary surface              | `primary.contrast`                 |
| Subtle primary tint card             | `primary.muted` / `primary.subtle` |
| Strong neutral CTA fill (black-ish)  | `secondary.solid`                  |

> **Note on accent:** the codebase uses a **warm terracotta** (`primary.*`, ~`#B25D27`) as the single accent — the handoff's "leaf green" was replaced. Use `primary.*` everywhere the handoff says "leaf".

### Category colors

The 12 reportage categories share `chroma 0.10`, varying hue only. They are **not in the Chakra theme yet**; when you need them, define them as a const map (OKLCH values from `design_handoff/DESIGN_SYSTEM.md` §1) and apply via inline `style={{ background: catColor[id] }}`. Never invent a 13th hue.

---

## 3 · Typography — pick a `textStyle`, don't invent

The recipes in [`textStyles.ts`](apps/website/src/utils/recipes/textStyles.ts) cover every editorial role. Defaults:

| Use case                                | `textStyle`                 |
| --------------------------------------- | --------------------------- |
| Section eyebrow (uppercase, mono, 11px) | `kicker` or `label.section` |
| Home hero H1                            | `display`                   |
| Page H1                                 | `heading.xl`                |
| Section opener (H2)                     | `heading.lg`                |
| Card title (H3)                         | `heading.md`                |
| Logo wordmark                           | `wordmark`                  |
| Hero subhead, page lead                 | `lead`                      |
| Italicized accent word in a headline    | `emphasis`                  |
| Big mono stat number                    | `stat.value`                |
| Small mono caption under a stat         | `stat.caption`              |
| List item title, small serif label      | `title.s`                   |
| Mono slug, ID, year, count              | `mono.s`                    |

**Body copy default**: `<Text>` with no override. Don't add `fontFamily="body"` — it's the default.

**Headline pattern**: serif H1 with one or two words in `<Text as="em" textStyle="emphasis">`, often followed by a colored period in `primary.solid`. Example: `Une bibliothèque vivante du <em>paysage urbain</em>.`

---

## 4 · Layout defaults

- **Container**: `<Container maxW="container.xl">` for standard pages. Vertical section padding `py={{ base: 6, md: 10 }}` for headers, `py={{ base: 10, md: 16 }}` for content sections.
- **Reading column**: `maxW="720px"` for body prose, `maxW="640px"` for narrow text.
- **Grids**:
  - Editorial 4-col (reportages): `gridTemplateColumns="repeat(4, 1fr)"`, gap `{ base: 4, md: 6 }`. Collapse to 2 cols below `md`, 1 below `sm`.
  - Editorial 3-col (À la une): `repeat(3, 1fr)`, gap `{ base: 6, md: 8 }`.
  - Hero / Contribuer 2-col: `1.1fr 1fr` or `1.2fr 1fr`, gap `{ base: 8, md: 14 }`. Stack below `md`.
  - Map page: `280px 1fr`, no padding, viewport-minus-header height.
- **Border radius**: `sm` (4px) for inputs/cards, `md` (6px) for tooltips/floating panels, **`full`** (`999px`) for buttons, chips, pill filters. The `Button` recipe already sets `borderRadius="full"` — don't override.
- **Borders**: `border="1px solid"` + `borderColor="border"` on inputs/cards, `borderColor="border.muted"` for list separators.

---

## 5 · Components — defaults & patterns

### Button (recipe in [`recipes/button.ts`](apps/website/src/utils/recipes/button.ts))

| Variant   | When to use                                   |
| --------- | --------------------------------------------- |
| `solid`   | Primary action — dark neutral pill (default). |
| `outline` | Secondary action — outlined pill.             |
| `ghost`   | Tertiary — neutral hover only.                |

For the **accent / leaf** CTA from the handoff (e.g. "Contribuer", "Envoyer la proposition"), use `solid` with `bg="primary.solid"` `_hover={{ bg: "primary.emphasized" }}` `color="primary.contrast"` overrides. (A dedicated `accent` variant is not yet defined; if you find yourself reaching for it more than twice, propose adding it to the recipe.)

Sizes: `sm` for header / inline actions (`px="14px"` is the convention from `Navbar.tsx`), default for primary CTAs. Icon-only buttons are 36×36 square with `p={0}`.

### PageHeader

Use [`components/sections/PageHeader.tsx`](apps/website/src/components/sections/PageHeader.tsx) for every top-level page. Pass `eyebrow`, `title`, `description`. Don't roll your own.

### Cards

Match [`components/cards/ProjectCard.tsx`](apps/website/src/components/cards/ProjectCard.tsx) for reportage / interview thumbnails. Image aspect `4/3` (default), `5/4` (featured), `4/5` (hero portrait). Hover: shadow lift + subtle `translateY(-1.5px)`, 250ms `cubic-bezier(0.25, 1, 0.5, 1)`. Eyebrow uses `kicker`, title uses `heading.md` or `title.s`, caption uses `mono.s`.

### Chip / Tag

Pill (`borderRadius="full"`), `bg="bg.subtle"`, `border="1px solid"`, `borderColor="border"`, `px={2.5}`, `py={1}`, `fontFamily="mono"`, `fontSize="12px"`, `color="fg.muted"`. Active state: `bg="secondary.solid"`, `color="secondary.contrast"`. Category chips precede the label with an 8×8 colored dot.

### Form fields

Input padding `px={3.5}`, `py={3}`, `border="1px solid"`, `borderColor="border"`, `borderRadius="sm"`, `bg="bg"`, `_focus={{ borderColor: "fg" }}`. Label `fontSize="13px"` `fontWeight={500}`. Required marker `*` in `primary.solid`. Helper `fontSize="11px"` `color="fg.subtle"`. Char counter mono, right-aligned.

Textarea: `minH="130px"`, `resize="vertical"`.

### Placeholder image

No real photo? Use a striped diagonal pattern via `backgroundImage="repeating-linear-gradient(135deg, transparent 0 14px, rgba(27,29,26,0.045) 14px 15px)"` on `bgColor="bg.subtle"`. Inside, a `bg="bg"` `border="1px solid border"` `borderRadius="2px"` mono label describing the **kind** of asset expected (e.g. `photo principale`, `portrait`). The future `<img alt>` should reflect that intent.

---

## 6 · Motion

Only these are allowed:

| Element                  | Effect                                  | Duration |
| ------------------------ | --------------------------------------- | -------: |
| Button hover             | `translateY(-1px)`                      |    150ms |
| Card hover               | shadow `sm → lg`, `translateY(-1.5px)`  |    250ms |
| List arrow on card hover | `translateX(3–4px)` of the chevron icon |    150ms |
| Chip toggle press        | scale `1 → 0.97 → 1`                    |    120ms |
| Map pin selected         | radius/opacity pulse, infinite          |   2400ms |
| Search dropdown open     | 100ms fade + 4px translateY             |    100ms |

Easing: `cubic-bezier(0.25, 1, 0.5, 1)` for hover lifts, plain `ease` elsewhere.

---

## 7 · Accessibility floor

- Body text contrast ≥ 4.5:1.
- All interactive elements: visible focus ring. Default Chakra ring is fine; on dark surfaces use `focusRing` semantic tokens (`primary.focusRing`, `secondary.focusRing`).
- Forms: `<label htmlFor>` paired with `<input id>` (or wrap, both ok).
- Tab order = DOM order. Map pins keyboard-focusable, announce project title.
- `<html lang="fr">`.

---

## 8 · Anti-patterns (frequent IA mistakes — avoid)

- Hardcoded hex colors anywhere in JSX. Use semantic tokens.
- `fontSize="2xl"` for headings instead of `textStyle="heading.lg"`.
- Sans-serif H1s. **Headings are serif** (Newsreader) by token default — don't override `fontFamily`.
- Bright saturated accents, gradients, or "tech" purples. The accent is one warm terracotta (`primary.*`); everything else is warm neutrals.
- Animated page entrances, scroll reveals, or parallax. Banned.
- Drop shadows on flat editorial surfaces (eyebrows, kickers, body cards). Shadow only on floating UI (map controls, dropdowns, hovered cards).
- Adding a new accent color "for variety". The visual system is monochrome warm + one accent + 12 fixed category hues. Nothing else.
- Emoji in copy. Use icon components.
- English microcopy. UI is French; if translating, keep complete sober sentences, no contractions, no exclamation marks.
- Reusing `Card.Root` defaults blindly — confirm padding, image aspect, and footer treatment match `ProjectCard.tsx`.

---

## 9 · When you need something not yet in the theme

1. Check if a semantic token covers it. Most needs do.
2. If not, check if an existing `textStyle` or button variant fits.
3. If still not, **propose adding it to the theme/recipes** rather than one-off styling. A new token is cheap; a one-off hex is debt.
4. For category colors specifically, see `design_handoff/DESIGN_SYSTEM.md` §1 — define them as a const map, never as theme tokens (they're data, not design).
