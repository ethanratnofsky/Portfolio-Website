# Design Handoff Analysis — "Compile the Draft" Portfolio Redesign

Source: `/Users/ethanratnofsky/Projects/Portfolio-Website/docs/handoff/design_handoff_portfolio_redesign/`

Concept: the site is a live drafting board. A terminal "drafts" the hero on load (typed build log → grid cascade → name snaps into a dashed spec box → dimension ruler measures it → signature inks as sign-off). All other sections use drafting-table language: sheets, plates, spec tables, title blocks, a flat-file archive, and one shared terminal command vocabulary (hero prompt = ⌘K palette). **Dark mode is the default**; light follows system preference with manual override. Fidelity is declared **high** — "Colors, type, spacing, copy, and motion timings are final unless marked PLACEHOLDER. Recreate pixel-perfectly." The `.dc.html` files are HTML design references, NOT production code; the target codebase does not exist yet (README recommends Next.js App Router or Astro + React islands, static-exported).

---

## 1. DESIGN TOKENS

Ship as CSS custom properties on `:root` (dark default) and `[data-theme="light"]` (exactly as in `tokens.css` / `tokens.json`).

### Color — surfaces & text

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#171310` | `#F6F0E4` |
| `--panel` (terminal, spec cards) | `#1E1914` | `#ECE4D2` |
| `--card` (work-card face) | `#171310` (= `--bg`) | `#FBF7EE` |
| `--ink` (headings, primary text) | `#F0E8DA` | `#221C13` |
| `--muted` (body, secondary) | `#9A8C7B` | `#8A7C69` |
| `--faint` (micro-labels, footer) | `#6E6357` | `#B3A48D` |
| `--tag` (skill-chip text) | `#C8B99F` | `#8A7C69` |

### Color — accent

| Token | Dark | Light |
|---|---|---|
| `--accent` | `#D9A05B` | `#9A6E2E` |
| `--accent-hover` | `#E8B76F` | `#AE7F3B` |
| `--accent-contrast` (text on accent) | `#171310` | `#F6F0E4` |

### Color — lines & chrome

| Token | Dark | Light |
|---|---|---|
| `--line` (card borders) | `rgba(240, 232, 218, 0.15)` | `rgba(34, 28, 19, 0.15)` |
| `--hairline` (dividers) | `rgba(240, 232, 218, 0.10)` | `rgba(34, 28, 19, 0.10)` |
| `--dash` (spec-box dashed borders) | `rgba(217, 160, 91, 0.35)` | `rgba(154, 110, 46, 0.40)` |
| `--grid-line` (drafting grid) | `rgba(240, 232, 218, 0.05)` | `rgba(34, 28, 19, 0.05)` |
| `--cross` (crosshair guides) | `rgba(217, 160, 91, 0.28)` | `rgba(154, 110, 46, 0.28)` |
| `--chip-bg` (coordinate chip) | `rgba(26, 21, 17, 0.72)` | `rgba(246, 240, 228, 0.80)` |
| `--scrim` (⌘K/lightbox) | `rgba(13, 11, 9, 0.55)` | `rgba(34, 28, 19, 0.35)` |

Note: README allows ranges in practice — `--line` 0.14–0.16, `--hairline` 0.08–0.12; the prototypes use values within these ranges (e.g. 0.16 card borders, 0.08/0.09/0.12 hairlines, grid at 0.045).

### Shadows

| Token | Dark | Light |
|---|---|---|
| `--shadow-panel` | `none` (borders carry depth) | `0 10px 30px rgba(34, 28, 19, 0.06)` (terminal card only) |
| `--shadow-modal` | `0 30px 80px rgba(0, 0, 0, 0.6)` | (dark value carries; only shadow-panel is overridden in light) |

### Typography tokens

- `--font-display: "Instrument Serif", Georgia, serif`
- `--font-body: "Instrument Sans", system-ui, sans-serif`
- `--font-mono: "IBM Plex Mono", ui-monospace, monospace`

Scale (desktop / mobile-390, from tokens + README):

| Token / role | Value |
|---|---|
| `--text-display` | `clamp(40px, 6.2vw, 92px)` — 92 desktop / 44 mobile, `white-space: nowrap` in hero |
| `--leading-display` | `1.06` (mobile hero uses 1.08) |
| `--text-h2` | `44px` (28 mobile), serif 400 |
| `--text-h3` | `24px` (serif italic asides 22–26) |
| `--text-chapter` (case-study heads) | `34px` |
| Card titles | 19–21 serif |
| `--text-body` | `16.5px` (16–17 desktop / 14.5–15 mobile), `--leading-body: 1.7` (case-study prose 1.75) |
| `--text-small` | `14.5px` |
| `--text-mono-label` | `11px` (labels 10–12), UPPERCASE |
| `--text-mono-micro` | `9.5px` (micro-captions 9–9.5) |
| `--text-terminal` | `12.5px` |
| `--track-label` | `0.16em` (labels span 0.12–0.24em) |
| `--track-kicker` | `0.22em` |
| Contact display | "Say hello." 72 / 40 |
| Email line | 30 / 19, serif italic |

Weights: Instrument Serif 400 + 400-italic only ("never bold"); Instrument Sans 400/500/600; IBM Plex Mono 400/500.

### Spacing (4px base)

| Token | Value | Use |
|---|---|---|
| `--space-1` | `8px` | chip gaps |
| `--space-2` | `16px` | stacks |
| `--space-3` | `24px` | card grids (wide variant 28px) |
| `--space-4` | `32px` | — |
| `--space-grid` | `56px` | drafting grid cell (44px mobile) |
| `--space-gutter` | `64px` | page gutter (20px mobile) |
| `--space-section` | `88px` | section padding-top desktop (44 mobile) |

Content widths: 1440 design frame; case-study prose max 720px; hero one-liner max 500px.

### Radius

| Token | Value |
|---|---|
| `--radius-sheet` | `0` (sheets/cards/images are square — radius deliberately scarce) |
| `--radius-button` | `3px` (buttons/chips) |
| `--radius-terminal` | `7px` |
| `--radius-modal` | `8px` (⌘K) |
| `--radius-pill` | `999px` |

### Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` — everywhere |
| `--dur-hover` | `150ms` |
| `--dur-reveal` | `700ms` (reveals 600–800ms) |
| `--dur-grid-line` | `500ms` |
| `--caret-blink` | `1.1s` (`steps(1)` infinite) |

tokens.json extras: `typingCharsPerSecond: 26`, `signatureInkS: 1.5`, `gridStagger { verticalPerLineS: 0.035, horizontalPerLineS: 0.05 }`, `playOncePerSession: true`, breakpoints `{ designFrame: 1440, tablet: 900, mobile: 390 }`, a11y `{ minHitTarget: 44, focusRing: "1px accent outline, 2px offset", accentUsage: "labels/large text only; body text uses ink/muted" }`.

---

## 2. FONTS

Three typefaces, all Google Fonts, all free, loaded via `<link>` with preconnect and `display=swap` (no local files):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

- **Instrument Serif** — 400 normal + 400 italic (`ital@0;1`). Display/headings. Never bold.
- **Instrument Sans** — 400/500/600. Body UI.
- **IBM Plex Mono** — 400/500. Labels, terminal, spec values.

(The full-site file additionally loads **Geist Mono**, but only for the annotation chrome around the screens — badges "6a/7a", NOTE lines — it is NOT part of the site design.)

Footer confirms: `SET IN INSTRUMENT SERIF, INSTRUMENT SANS & IBM PLEX MONO`.

---

## 3. FULL-SITE DRAFT STRUCTURE

The full-site file contains screens `#6a` (desktop dark, canonical), `#6b` (desktop light, settled), `#6c`/`#6d` (mobile 390 dark/light), `#6e` (SHEET 00 design-system spec), `#7a` (case study), `#7b` (not-yet-drawn/404), `#7c` (⌘K palette). All in 1440px frames (390 mobile).

### Nav (all pages)
Height ~74px (padding `26px 64px`), border-bottom 1px hairline. Left: signature SVG logo (`logo_signature_ivory.svg` dark / `logo_signature_ink.svg` light), height 22px (20 on subpages), links home. Right, IBM Plex Mono 11px, letter-spacing 0.16em, gap 30px: `WORK` `DESIGN` `PHOTO` `ABOUT` `CONTACT` — active = ink, inactive = muted, hover → ink — then accent-outlined chip `RESUME ↓` (1px border `rgba(217,160,91,0.5)`, padding 9×14, radius 3, nowrap; hover fill `rgba(217,160,91,0.12)`), then theme toggle glyph `◐` (dark) / `◑` (light), title "Theme follows system; click to override". Case-study nav swaps left links for accent `← ALL DRAWINGS` + ABOUT + CONTACT.
Mobile: 16px logo + `◐` + `≡` hamburger (padding gives ≥44px hit targets); menu = full-screen overlay in the same mono style (described in README, not drawn).

### SHEET 01 — Hero (height 800px desktop)
Layers bottom→top: (0) crosshair guides, (1) 56px drafting grid (in #6a: a `background-image` double linear-gradient at `rgba(240,232,218,0.045)`, `background-size: 56px 56px`, fading in via `appear 1s 2.1s`; the per-line draw is in the Hero Prototype — see §4), (2) content, (3) coordinate chip.

Two columns (padding `48px 64px 0`, gap 64): **left**, 430px terminal window (radius 7, `--panel` bg, traffic-light dots 9px — first two `rgba(240,232,218,0.16)`, third amber `rgba(217,160,91,0.55)` — title `ethan@nyc — draft`, mono 11 muted); log lines mono 12.5px typed via `typeIn` width animations:

- `$ ethan draft --hero` (0.6s steps(20) @0.3s)
- `▸ grid: 12-col / 56px .............. ok` (1s steps(39) @1.1s; "ok" in accent)
- `▸ type: instrument serif / 92 ...... ok` (1s steps(39) @2.3s)
- `▸ dimension: 760px ................. ok` (0.9s steps(39) @3.5s)
- `▸ sign-off: e. ratnofsky ....... inking` (0.9s steps(39) @4.6s)
- `✓ drafted in 6.2s` (accent, 0.5s steps(17) @7.2s) + blinking 8×14 amber block caret

Mobile terminal variant: `▸ grid: 8-col / 44px ....... ok` / `▸ type: serif / 44 ......... ok` / `▸ sign-off: e.r. ....... inking`.

**Right** column (vertically centered): dimension ruler (end ticks 1×10px `rgba(217,160,91,0.6)`, 1px rails `rgba(217,160,91,0.45)`, centered live px count in accent mono 10, letter-spacing 0.1em, max-width 700, appears @4.4s) → the name in a **dashed spec box** (1px dashed `--dash`, padding `4px 18px`, `popIn 0.7s @3.3s`):

> **`Ethan Ratnofsky.`** — Instrument Serif 92/1.06, nowrap; the period in accent.

Spec callout absolutely to the box's right (`right: -150px; top: 6px`, 1px dotted amber left border, padding-left 12, mono 10/1.9, appears @3.7s):

> `INSTRUMENT SERIF` / `92 / 1.06` / `#F0E8DA` (hex in accent; `#221C13` in light)

One-liner (17px/1.7 muted, max-width 500, appears @3.9s) — **verbatim from both prototypes**:

> "Full-stack engineer in New York. I draft with a designer's eye, build with an engineer's hand — and refuse to lose a pixel in between."

(README's copy table says "…refuse to lose a pixel **between the two**." — see Gaps.)

Signature row (margin-top 34): amber signature SVG height 34 revealed by container `max-width` 0→230px, `drawWide 1.5s ease-in-out @5.5s` (img fixed at `width: 224px; max-width: none`) + label `SIGNED — JUL 2026` (mono 10, tracking 0.14em, appears @7s). Light mode uses the bronze SVG.

Hero footer strip (padding `20px 64px`, hairline top, mono 11 tracking 0.12em): left `40.7447° N — 73.9485° W` (crosshair cursor; hover swaps text to `LONG ISLAND CITY, NEW YORK ⌖` and color to accent) · center `SHEET 01 — DRAWN BY CODE, APPROVED BY HAND` · right accent `SHEET 02 ↓`.

README also specifies a kicker above the ruler — `SOFTWARE ENGINEER — NEW YORK` (mono 12, tracking 0.22em, accent) — which neither prototype renders (see Gaps).

### SHEET 02 — Work "Working drawings" (padding `88px 64px 72px`)
Header row: `SHEET 02` (mono 12 accent) + "Working drawings" (serif 44); right: `05 FEATURED · 04 IN THE FLAT FILE` (mono 11, 0.14em, muted).

**Featured grid** — `grid-template-columns: 1fr 1fr`, gap 28. Card: 1px `--line` border, radius 0, cursor pointer, hover border → `rgba(217,160,91,0.55)` (README adds image scale 1.02 over 600ms); image 300px `object-fit: cover` top-aligned; below, a 3-column title-block strip `1.2fr 1fr 1fr`, mono 10 tracking 0.06em, cells divided by hairlines, faint labels `PROJECT` / `STACK / DATE` / `ISSUE`; project name in Instrument Serif 19. Cards:

1. **House Vandy** · `REACT · NODE · DOCKER — 2022` · `LIVE ↗` (accent) `GH ↗` `STUDY →`
2. **ReVU** (`revu2.png`, object-position `center 12%`) · `REACT NATIVE — 2022` · `APP ↗` (accent) `GH ↗` `STUDY →`
3. **Her Future Coalition** — no image; **text sheet**: 40px faint grid bg, kicker `PRIVATE DEPLOY — TEXT SHEET` (accent mono 10, 0.12em), serif-italic pull-quote 26/1.45: *"Replaced paper and spreadsheets for an anti-trafficking nonprofit — led five engineers to ship it."* · `REACT · EXPRESS — 2023` · `STUDY →` (accent) `GH ↗`
4. **Flopaholic** · `REACT · CUSTOM ENGINE — 2022` · `LIVE ↗` (accent) `GH ↗`

Links render only if the field exists; primary link accent, rest muted → ink on hover.

**Rev strip** (full-width row, border, padding `18px 24px`, margin-top 28): grayscale(60%) `portfolio_website.png` 150×84 → `REV A — 2021` (mono faint) → amber `→` → serif 24 "This website — *REV D, you're inside it*" + `DESIGNED & BUILT FROM SCRATCH — 2026` (mono 10 muted) → `STUDY →` (accent) `GH ↗`.

**The flat file** (margin-top 56): label `THE FLAT FILE — EARLIER DRAWINGS` (mono 11, 0.14em muted). Table grid `46px 1.4fr 1.2fr 70px 220px`; header row mono 9.5 tracking 0.14em faint: `NO. / PROJECT / STACK / YEAR / LINKS` (links right-aligned), 1px bottom rule at 0.2 alpha. Rows padding `18px 12px`, hairline dividers (0.09), serif 21 names, hover row bg `rgba(217,160,91,0.05)` + name → accent:

- `006` United Front Against Riverblindness · `REACT NATIVE · OFFLINE-FIRST` · 2022 · `GH ↗`
- `007` Plasmid Visualizer · `REACT · PYTHON · POSTGRES` · 2021 · `ABBVIE INTERNAL` (faint, no link)
- `008` Mass Spectrometry Toolkit 2.0 · `FLASK · JQUERY · DOCKER` · 2020 · `ABBVIE INTERNAL`
- `009` Playlist Bridge · `FLASK · JINJA2 · TIDAL ⇄ APPLE MUSIC` · 2020 · `GH ↗`

Mobile: featured cards stack 1-col (image 170px, compact meta rows with year right-aligned); archive collapses to outlined button `THE FLAT FILE — ALL 9 →`.

### SHEET 03 — Design "Design work"
Header: `SHEET 03` + serif 44 "Design work" + serif-italic 22 muted aside *"— marks & posters, the Behance shelf"*; right accent link `BEHANCE — FULL SHELF ↗` (hover underline). Grid 4 equal columns, gap 24, 260px tiles. Tile = 1px border, image, mono caption strip 9.5 tracking 0.08em: left `DES-014 — NINJA NAHTEY`, right faint `2017`. Only tile 1 is real (`gallery/NinjaNahteyLogo2017.jpg`); tiles 2–4 are `<image-slot>` drop targets captioned `DES-0XX — TITLE / YEAR` — to be replaced with ~6–8 curated Behance exports. Hover: subtle zoom + border→accent; click → lightbox (dark scrim, plate caption) per README.

### SHEET 04 — Photo "Photographs"
Same pattern: `SHEET 04` + serif 44 "Photographs" + aside *"— 35mm & digital, mostly personal"*; right `FLICKR — FULL ROLL ↗`. Mixed-width grid `1.4fr 1fr 1fr 1.2fr`, gap 24, 300px tiles. Tile 1 real (`gallery/COVIDSZNPhotography.jpg`) captioned `FR-36 — COVID SZN / 2020`; rest `<image-slot>` targets `FR-XX / YEAR` (~8–12 Flickr exports). Frame/plate numbering scheme `DES-0XX` / `FR-XX`.

### SHEET 05 — About
Header `SHEET 05` + serif 44 "About". Two columns flex `1.15 / 1`, gap 72.

**Left**: serif 40/1.25 headline — "Engineer by trade, *draftsman by temperament*." (italic second phrase; period accent, non-italic). Body 16/1.75 muted, max-width 560, three paragraphs verbatim:

1. "I grew up in Newton, MA, studied computer science at Vanderbilt, and now build software in New York — the whole stack, with particular joy in the parts people touch."
2. "Before that: nonprofit platforms with Change++ (leading a team of five), two summers in AbbVie's Bioresearch Center, and a student government app that made it to the App Store."
3. "Off the clock I shoot film, draw letterforms, and keep this site pixel-perfect out of principle."

Skill chips (mono 10, 0.1em, 1px border 0.18 alpha, radius 3, padding 6×10, color `--tag`, gap 8): `REACT` `TYPESCRIPT` `NODE` `MONGODB` `PYTHON` `FIGMA` — but README overrides: *"design/creative tools of Ethan's choosing. Do not mention his current employer in the bio; do not mention Figma."* (see Gaps).

**Right**: `EXPERIENCE — SPECIFICATION` panel (`--panel` bg, 1px border; header strip mono 10 tracking 0.18em; rows padding `15px 18px`, hairline dividers; serif 19 name + mono 10.5 role, dates right, current row's dates in accent):

- Kinetik — SOFTWARE ENGINEER · `2023 — NOW` (accent)
- Kinetik — SWE INTERN · `2022`
- Change++ — ENGINEERING MANAGER · `2022 — 23`
- Change++ — SOFTWARE ENGINEER · `2021 — 22`
- AbbVie — SWE INTERN · `2020 — 21`
- Vanderbilt — B.S. COMPUTER SCIENCE · `2019 — 23`

Below: primary button `RESUME.PDF ↓` (accent bg, `--accent-contrast` text, mono 11 tracking 0.14em, padding 15×26, radius 3; hover `--accent-hover`). Resume PDF pending.

### SHEET 06 — Contact (padding `96px 64px 0`)
Header `SHEET 06` + serif 44 "Contact". Two columns gap 80.

**Left**: "Say hello." serif 72/1.1 (period accent) → email line serif italic 30 accent with 1px dotted amber underline (solid on hover), margin-top 22. **Anti-scraper reveal**: renders masked `▮▮▮▮▮@▮▮▮▮▮▮▮▮▮▮▮▮▮.com` + mono 9.5 hint `CLICK TO REVEAL — ASSEMBLED IN JS, NEVER IN SOURCE`; on click assembles `["hello", "@", "ethanratnofsky", ".com"].join("")` at runtime (hint becomes `PLACEHOLDER ADDRESS — SWAP AT BUILD`); address must never appear in served HTML; swap in `mailto:`. **Address is a PLACEHOLDER.** Social links (mono 11, 0.14em, muted→ink hover): `GITHUB ↗ LINKEDIN ↗ BEHANCE ↗ FLICKR ↗` — real URLs: github.com/ethanratnofsky · linkedin.com/in/ethan-ratnofsky · behance.net/ethanratnofsky · flickr.com/photos/ethanratnofsky.

**Right — form**: NAME + EMAIL side by side (gap 26), MESSAGE textarea (rows 4); borderless fields with 1px bottom hairline (0.25 alpha), focus → accent underline; labels mono 9.5 uppercase tracking 0.16em faint; field text Instrument Sans 15; submit `SEND →` primary button right-aligned. Client validation (non-empty name/message, email format); errors as accent mono micro-text under fields. Backend: owner's choice (Formspree / Resend / API route). The form is the primary contact path; email reveal is fallback.

**Footer** (hairline top, mono 10 tracking 0.12em faint): left `DRAWN BY CODE, APPROVED BY HAND — © 2026 E.R.` · center signature SVG 15px at 55% opacity (**click = replay easter egg**) · right `SET IN INSTRUMENT SERIF, INSTRUMENT SANS & IBM PLEX MONO`. Mobile footer condenses to `© 2026 E.R.` / 12px signature / `DRAWN BY CODE`.

### Case study template (#7a, e.g. House Vandy)
Nav with accent `← ALL DRAWINGS`. **Title block**: 5-col mono grid `1fr 2fr 0.6fr 0.8fr 1.2fr` (mono 10, values 11.5, faint labels): `DRAWING NO.` `HV-2022-01` / `TITLE` `HOUSE VANDY — APARTMENT HUNTING, AUTOMATED` / `YEAR` `2022` / `TEAM` `3 ENGINEERS` / `ISSUE` `LIVE ↗` (accent) `GITHUB ↗`. Full-bleed hero plate 460px cover with corner chips `PLATE I — LISTINGS VIEW` (ink) + `WEB APP` (accent border) on translucent dark bg. Body (padding 64, gap 64): 300px sticky **spec rail** — SPECIFICATION panel rows `ROLE FULL STACK + INFRA` / `CONTEXT CS-4287, VANDERBILT` / `STACK REACT · NODE · MONGO / DOCKER · CRON` / `DEPLOY CHAMELEON CLOUD VM` — then `ON THIS SHEET` chapter list (`01 — THE PROBLEM` active in accent, `02 — THE BUILD`, `03 — THE OUTCOME`), scroll-tracked. Prose column max 720: numbered serif-34 chapters (`01` in accent mono 12) — chapter copy is written for House Vandy (problem: four apartment sites, no comparison; build: nightly cron scrapers → MongoDB → REST API → React filters, six Docker containers on a Chameleon Cloud VM; outcome: shipped end-to-end for Principles of Cloud Computing, survived the semester without a restart). Inline plate: panel-bg frame, 10px padding, `house_vandy2.png`, caption `PLATE II — FILTERING & COMPARISON` (mono 9.5). Pull-quote serif italic 25/1.5 ink with 2px accent left border: *"The scrapers run every 24 hours — the data is never staler than a day, and nobody refreshes four websites again."* Footer strip: `← PREV — FLOPAHOLIC` / `HV-2022-01 · SIGNED E.R.` / `NEXT — REVU →` (hover → accent). Chapters/plates omit gracefully when thin; plates fade+rise 600–800ms on scroll into view.

### Not-yet-drawn & 404 (#7b)
Centered on faint 56px grid, 640px tall, `+` register marks in all four corners (mono 10, 0.3 alpha). Kicker `SHEET QUEUED — NOT IN THE FLAT FILE YET` (accent mono 11, tracking 0.24em) → serif 64 "This sheet isn't *drawn* yet." (period accent) → 460px status terminal titled `ethan@nyc — status` (`$ ethan draft --study revu` / `▸ status: queued for drafting` (value accent) / `▸ check back soon ▮` blinking caret) → buttons `← BACK TO WORK` (primary accent) + `MEANWHILE — GITHUB ↗` (ink outline; hover accent border/text). **404 variant, same template**: kicker `VOID SHEET — NOTHING AT THIS NUMBER`, headline "This drawing doesn't exist.", terminal prints `error 404: sheet not found`.

### ⌘K palette (#7c)
Opens with **⌘K / Ctrl-K or `$`**. Scrim `rgba(13,11,9,0.55)`; modal 580px wide at top 130px, `--panel` bg, 1px border (0.18), radius 8, `--shadow-modal`. Header row: `$` (accent mono 13) + typed query + 8×15 amber block caret + right `ESC` chip (mono 9.5 faint, bordered). Group label `NAVIGATE` (mono 9, 0.16em faint): rows = sheet number (mono 10) + serif 19 name + fuzzy-matched path with matched chars in accent (e.g. query `wo` → `/`**`wo`**`rk`); selected row `rgba(217,160,91,0.08)` bg + 2px accent left border + `↵` glyph. Group `ACTIONS`: `◐ Toggle theme` / `↓ Download resume` / `⟲ Replay the draft`; unselected hover `rgba(217,160,91,0.05)`. Footer: `↑↓ NAVIGATE · ↵ OPEN · ESC CLOSE` / `FUZZY-MATCHED, TERMINAL-FLAVORED`. Same command vocabulary as the hero terminal — one language site-wide.

### Global behavior
- Easing `cubic-bezier(0.22, 1, 0.36, 1)` everywhere; hovers 150ms; reveals 600–800ms; scroll reveals fade+rise 12px once at ~15% viewport threshold.
- Theme: default dark; respect `prefers-color-scheme` on first visit; `◐`/`◑` toggle persists override in `localStorage`; swap = token swap only; signature/logo SVGs swap ivory↔ink, amber↔bronze.
- Reduced motion: settled states, no typing/counting/grid-draw; caret may blink; reveals become plain fades.
- Keyboard: `⌘K`/`$` palette · `R` replay (when hero in view) · `Esc` closes overlays. Focus rings 1px accent outline, 2px offset.
- Breakpoints: 1440 design width; ~900 tablet (work grid → 1 col, about stacked); 390 mobile (gutters 20, grid 44px, hamburger nav). Hit targets ≥44px.
- A11y: semantic landmarks, `aria-live="polite"` on terminal log, `role="dialog"` on palette/lightbox, alt text on all plates; accent only for labels/large text (body uses ink/muted).
- State model (README): `theme`, `introPlayed` (sessionStorage), hero timeline phase + measured `dimTarget`/`nameSize`/grid counts (resize-observed) + terminal `lines[]` (last 8) + crosshair `x,y,visible`; palette `open/query/selectedIndex`; contact `emailRevealed`/fields/validation/submit status (idle/sending/sent/error); case study active chapter (IntersectionObserver).

---

## 4. HERO PROTOTYPE — the animated moment (`Hero Prototype.dc.html`, the motion spec to port ~1:1)

**CSS keyframes**: `blink` (opacity 1→0 at 50%, `steps(1)`, 1.1s), `typeIn` (`from { width: 0 }`), `appear` (fade), `popIn` (fade + `translateY(10px)`→0), `drawWide` (`from { max-width: 0 }`), `drawTall` (`from { max-height: 0 }`). `prefers-reduced-motion: reduce` collapses all animation durations to 0.001s (plus JS skips the timeline).

**Timeline** (seconds from load; typed lines are pure CSS `width: Nch` + `overflow: hidden` + `steps(N)`, widths matching char counts at ~26 chars/s):

| t (s) | Event | Mechanism |
|---|---|---|
| 0.3 | `$ ethan draft --hero` types | `typeIn 0.6s steps(20)` |
| 1.1 | `▸ grid: 12-col / 56px … ok` types | `typeIn 1s steps(39)` |
| 2.1 | Vertical grid lines draw **top→bottom**, staggered left→right | per-line `drawTall 0.5s ease-out (2.1 + i·0.035)s both` (`max-height` reveal) |
| 2.3 | `▸ type: instrument serif / 92 … ok` types | `typeIn 1s steps(39)` |
| 2.35 | Horizontal lines draw **left→right**, staggered top→bottom | per-line `drawWide 0.5s ease-out (2.35 + j·0.05)s both` (`max-width`) |
| 3.3 | Name + dashed spec box pop in | `popIn 0.7s` (y+10 → 0, fade) |
| 3.5 | `▸ dimension: measured live … ok` types | `typeIn 0.9s steps(38)` |
| 3.7 | Type-spec callout fades in | `appear 0.6s` |
| 3.9 | One-liner fades in | `appear 0.7s` |
| 4.4 | Ruler appears; rails draw outward; px value counts 0→measured width | `appear 0.5s` + `drawWide 0.8s ease-out`; JS rAF counter, ease-out cubic `1-(1-p)^3` over 0.8s window |
| 4.6 | `▸ sign-off: e. ratnofsky … inking` types | `typeIn 0.9s steps(39)` |
| 5.5 | Signature inks | container `max-width` 0→230px, `drawWide 1.5s ease-in-out both`; img fixed 224px wide, 34px tall (upgrade path: SVG `stroke-dashoffset` true stroke draw) |
| 7.0 | `SIGNED — JUL 2026` fades in | `appear 0.6s` |
| 7.2 | `✓ drafted in 6.2s` appears; counter counts 0→6.2 | `appear 0.2s`; JS rAF, same ease-out over 0.6s; rAF loop stops at t=8.1 |
| 7.6 | Interactive `$` prompt appears | `appear 0.3s` |

**JS driving it** (`class Component extends DCLogic`, React-based):
- **Honest measurement**: `measure()` (at +350ms and on every `resize`) reads `dimRef.getBoundingClientRect().width` → `dimTarget` (state default 760), hero rect → `heroW/heroH` (defaults 1440×700), and `Math.round(parseFloat(getComputedStyle(nameRef).fontSize))` → `nameSize` shown in the spec callout — the displayed numbers equal reality, re-measured on resize.
- **Grid line counts**: `vLines = floor(heroW / 56)` at `left: (i+1)*56px`; `hLines = floor(heroH / 56)` at `top: (j+1)*56px`; 1px lines in `rgba(240,232,218,0.05)`. Once `done`, `anim: none` — lines render settled, no replay on resize.
- **Timeline**: `startTimeline()` runs a `requestAnimationFrame` loop against `performance.now()`; dim counts in the (4.4→5.2) window, drafted counter in (7.2→7.8); loop ends at 8.1s setting `done: true`. Under reduced motion it skips straight to settled (`dim=dimTarget, drafted=6.2, done=true`).
- **Replay**: `replay()` cancels rAF, sets `seqOn:false` (unmounting the hero subtree), and 60ms later remounts + restarts. Triggered by footer button `REPLAY ⟲ · R`, the `R` key (guarded against meta/ctrl and input/textarea focus), or the `replay` command. (Production adds: run once per session via `sessionStorage`; contact-footer signature click as easter egg.)
- **Interactive terminal** (after 7.6s): a visually hidden `<input>` (opacity 0, absolute inset 0) overlays the prompt row; rendered line is `$ {typed}▮` where the amber 8×14 block caret (`blink 1.1s steps(1) infinite`) is the only caret; faint hint `try: help` when empty; clicking anywhere on the terminal focuses the input. Enter runs `runCommand`: `help` → "commands: work · design · photo · about · contact · whoami · replay · clear"; `whoami` → "full-stack engineer, new york — designer's eye, engineer's hand"; `work|design|photo|about|contact` → prints accent "→ scrolling to /x (wired in the build)" (production: smooth-scroll); `replay`; `clear`; `sudo …` → "nice try." (accent); unknown → "command not found: x — try help". Buffer keeps the **last 8 lines** (`slice(-8)`), scrolling inside `max-height: 320px`.
- **Crosshair** (desktop only, hide on touch): hero has `cursor: crosshair`; `onMouseMove` is rAF-throttled and **snapped to an 8px grid** (`snapGrid` prop, range 1–56); two 1px amber guides (`rgba(217,160,91,0.28)`) at `z-index: 0` (behind content); coordinate chip at cursor +14/+14 (README: +14,+18, flips at edges), `z-index: 3`, mono 9 tracking 0.1em, amber at 0.85 on `rgba(26,21,17,0.72)` with 1px `rgba(217,160,91,0.25)` border, radius 2, text `X 0672 · Y 0231 — SNAP 8` (4-digit zero-padded px relative to hero). Hidden on mouse leave. A `crosshair` boolean prop can disable it.
- Footer center (prototype only): `PROTOTYPE — YOUR CURSOR IS A DRAFTING TOOL · NUMBERS ARE LIVE`.

---

## 5. BEHAVIORS — support.js and image-slot.js

Both are **runtime for the reference files only — not part of the build**.

- **`support.js`** is a generated "dc-runtime" bundle (from `dc-runtime/src/*.ts`). It loads React 18.3.1 + ReactDOM UMD from unpkg (SRI-pinned), parses the `<x-dc>` template in the host HTML, compiles it into React elements (supporting `{{ … }}` interpolation, `sc-if` / `sc-for` control flow, `style-hover` / `style-focus` pseudo-class attributes via a generated stylesheet, `<helmet>` head injection, and `x-import` external modules), and evaluates the `<script data-dc-script>` logic class (`class Component extends DCLogic` with `state` / `setState` / `renderVals()` / lifecycle). It also handles streaming placeholders, error boundaries, prop editors (`data-props`), and print CSS. **It contains no site behavior** — no theme toggle or scroll effects; all design behavior lives in the per-file logic classes described above.
- **`image-slot.js`** defines the `<image-slot>` custom element — a user-fillable image placeholder used for the gallery drop targets. Drag-and-drop or click-to-browse (PNG/JPEG/WebP/AVIF only; SVG/GIF rejected), downscales through a canvas to WebP q0.85 (long side ≤ min(1200px, 2× slot width)), persists to a `.image-slots.state.json` sidecar (read via fetch, written via `window.omelette.writeFile` — read-only outside that host runtime). Supports `shape`/`radius`/`mask`/`fit`/`position`/`placeholder`/`src`/`credit` attributes and a double-click "reframe" mode (pan/zoom crop with corner handles, wheel zoom, crop stored as frame-% so it survives resize). In production these slots are replaced by real curated exports.

---

## 6. IMAGES (`src/images/`)

- **Signature logo SVGs** (all `viewBox="0 0 1846.49 280.27"`, `<title>Ethan Ratnofsky</title>`, paths `first-name`/…):
  - `logo_signature.svg` — original, no fill attribute (renders black)
  - `logo_signature_ivory.svg` — `fill="#F4EDE2"` (README calls it "#F0E8DA-family") — dark-mode nav/footer logo
  - `logo_signature_amber.svg` — `fill="#DFA85E"` — dark-mode hero signature ink
  - `logo_signature_ink.svg` — `fill="#201910"` — light-mode nav/footer logo
  - `logo_signature_bronze.svg` — `fill="#9A6E2E"` — light-mode hero signature ink
  - For the true stroke-draw upgrade, retrace as a single-path stroke SVG.
- **Project screenshots**: `house_vandy.png` (featured card + case-study Plate I), `house_vandy2.png` (case-study Plate II), `revu2.png` (ReVU card, object-position `center 12%`), `flopaholic.png`, `portfolio_website.png` (rev-strip REV A thumbnail, grayscale 60%).
- **Gallery seeds**: `gallery/NinjaNahteyLogo2017.jpg` (DES-014, 2017), `gallery/COVIDSZNPhotography.jpg` (FR-36, 2020). The rest come from Ethan's Behance/Flickr exports.

---

## 7. GAPS / AMBIGUITIES (implementer must decide or confirm)

**Explicit open items (README, confirm with Ethan before shipping):**
1. Real contact email — `hello@ethanratnofsky.com` is a placeholder; must be assembled in JS, never in served source.
2. Resume PDF file — pending.
3. Curated Behance/Flickr exports + real `DES-0XX` / `FR-XX` captions (~6–8 design, ~8–12 photo) to replace `<image-slot>` targets.
4. Form backend choice (Formspree / Resend / API route).
5. Case-study copy for ReVU, Her Future Coalition, Flopaholic (only House Vandy's is written; template omits thin chapters gracefully).

**Internal contradictions to resolve:**
6. **One-liner copy conflict**: README table says "…refuse to lose a pixel **between the two**."; both prototypes render "…refuse to lose a pixel **in between**." Pick one (README claims copy is final, but the rendered references disagree).
7. **Figma chip conflict**: the #6a About prototype shows a `FIGMA` skill chip; README explicitly says "do not mention Figma" and to substitute design/creative tools of Ethan's choosing. Follow the README; the remaining tools are unspecified.
8. **Hero kicker**: README specifies kicker `SOFTWARE ENGINEER — NEW YORK` (mono 12, 0.22em, accent) above the ruler; neither prototype renders it. Decide in or out (and its animation slot).
9. **Coordinate chip**: README says offset +14/+18 and "flips at edges"; the prototype uses +14/+14 and never flips. Edge-flip logic must be written from scratch. The prototype also appends `— SNAP 8` and snaps the crosshair to an 8px grid — README's chip text omits SNAP; decide whether snapping ships.
10. **Grid draw vs fade**: Hero Prototype draws grid lines individually (the spec to port); the full-site #6a hero uses a single background-image grid fading in at 2.1s. Non-hero sections use static background grids — only the hero gets the line-by-line draw.
11. **Spec-callout placement**: full site positions it absolutely at `right: -150px` beside the name box (3-line stack); Hero Prototype renders it as a single line below the box. The README describes "to its right." At narrow widths the absolute version will overflow — responsive fallback unspecified.

**Unspecified / must be designed from the README's prose only:**
12. Mobile full-screen nav overlay — described ("same mono style") but never drawn.
13. Gallery lightbox — "dark scrim, plate caption" only; no layout, close affordance, or keyboard behavior drawn.
14. Tablet (~900px) layouts — breakpoints named but no tablet screens exist.
15. Form submit states — state model names idle/sending/sent/error, but no visual design for sending/sent/error beyond accent micro-text errors.
16. ⌘K NAVIGATE list — only "02 Working drawings" and "05 About" are drawn; full entry list (all sheets? case studies?) and fuzzy-match algorithm are implementer's choice.
17. `sessionStorage`/`localStorage` key names, and theme-override semantics (e.g., does a later system-preference change beat a stored override?) unspecified.
18. "05 FEATURED" count: the featured grid has 4 cards; the rev strip ("This website") is presumably the 5th — worth confirming ("ALL 9" mobile = 5 featured + 4 flat-file, consistent).
19. Case-study scroll-tracking (IntersectionObserver thresholds for `ON THIS SHEET`) and scroll-reveal implementation details (once-only, ~15% threshold) are prose-level only.
20. Signature "true stroke draw" upgrade (`stroke-dashoffset`) requires retracing the SVG as a single-path stroke — asset doesn't exist yet; width-reveal is the shipping fallback.
21. Terminal `$` opening the ⌘K palette vs. the hero terminal accepting `$` input — key-routing precedence when the hero input is focused is unspecified.
22. Hero terminal log line widths (`ch` counts) must be recomputed if any copy changes — widths are hard-coupled to character counts (e.g., a real drafted-time other than 6.2s would change `width: 17ch`).
23. Light-mode `--card` (`#FBF7EE`) is used on work/gallery cards in #6b; dark mode's `--card` equals `--bg` — cards in dark are distinguished by border only.
24. Footer coordinates hover (`LONG ISLAND CITY, NEW YORK ⌖`) — accent color on hover in full site; whether the swap animates is unspecified.
