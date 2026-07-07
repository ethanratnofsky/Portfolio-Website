# Testimonials + Field Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the "In their words" (ON RECORD) testimonials carousel and "Field report" (APPENDIX A) soccer-stats sections to the homepage, between About and Contact, per `docs/handoff/design_handoff_testimonials_field_report/README.md`.

**Architecture:** Two new self-fetching sheet components following the established sheet pattern (scoped styles, tokens + `color-mix`, `reveal` blocks, processed TS `<script>`s). All soccer stats derive at build time from a single `Match[]` in `src/data/soccer.ts` via pure functions in `src/data/soccer-derive.ts`; every view (tiles, ledger, match log, three chart scales, record view) is server-rendered and toggled client-side with `hidden`. The carousel is a scroll-snap track with JS-driven arrows/indicators/keyboard and responsive page re-chunking.

**Tech Stack:** Astro 5 static, TypeScript strict, zero client frameworks, no new dependencies.

## Global Constraints

- Design source of truth: `docs/handoff/design_handoff_testimonials_field_report/README.md` + extracted screens (session scratchpad `screens/*.html`). High fidelity; quotes/names/sealed-season numbers are placeholders (Summer 2026 numbers are real).
- Section order: About (SHEET 05) → In their words (`ON RECORD`) → Field report (`APPENDIX A`) → Contact (SHEET 06). Not nav items; nav unchanged.
- "GitHub" is never abbreviated "GH"; mono label registers are ALL-CAPS.
- Colors ONLY via tokens + `color-mix(in srgb, …)`. The handoff's raw `#6E6357` faint fails AA — use `var(--faint)`. New section-local custom props (`--fr-grey`, `--fr-deep`, `--fr-ink2`, `--fr-accent2`) must be contrast-checked per theme like tokens.css (nudge along hue, keep handoff original in a comment). Deep-faint TEXT uses `var(--faint)` (AA); deep-faint is OK for disabled controls and non-meaning-bearing strokes.
- Everything rendered in the field report is derived from `Match[]` — no stored totals.
- All aggregates must reproduce the design's placeholder numbers exactly (verified by script): all-time 24 P / 14–3–7 / 25+† G / 7 A / 04 seasons; form W L W W W W; streak W4; goals/match 1.04; Fall '25 2–1–2 · 4 G · 1 A (5 matches); Winter '25–26 3–1–2 · 6† G · 2 A (6); Spring '26 4–1–2 · 7 G · 3 A (7); Summer '26 5–0–1 · 8+ G · 1 A (6, real).
- Breakpoints 900px / 640px; `prefers-reduced-motion` respected (house patterns); transitions `var(--dur-hover) var(--ease)`; reveal via `.reveal` class only.
- Interactions are client-side state only, no routing, nothing persisted.

---

### Task 1: Testimonials data (`src/data/testimonials.ts`)

**Files:** Create `src/data/testimonials.ts`.

**Produces:**

```ts
export interface Testimonial {
    quote: string; // real quotation marks included at render, not in data
    name: string; // "S. Patel"
    role: string; // rendered uppercase
    date: string; // "2026-06" (YYYY-MM received)
    stamp?: string; // "ON RECORD" | "WOULD SHIP AGAIN" | "NO OBJECTIONS" | custom
}
export const TESTIMONIALS: Testimonial[]; // append-only, oldest first; NO. = index+1
```

- [ ] 14 placeholder entries, oldest→newest. Entries 9–14 verbatim from the design screen (T. Walsh 2025-08 … S. Patel 2026-06 with their stamps); invent 1–8 (2023-10 … 2025-05) referencing Ethan's real background (Kinetik, Vanderbilt, ChangePlusPlus, AbbVie), ~half stamped. File header: placeholder warning + `TODO(ethan)` per data-file convention. Stamp rotation derived from entry number in the component (cycle −4°/+3°/−2°), not stored.
- [ ] `npx astro check` passes.

### Task 2: TestimonialsSheet component

**Files:** Create `src/components/testimonials/TestimonialsSheet.astro`; modify `src/pages/index.astro` (import + render after `<AboutSheet />`).

Section: `<section id="testimonials" class="sheet hairline-top" aria-label="In their words">`, padding `var(--space-section) var(--space-gutter) 80px`. Header via `SectionHeader sheet="ON RECORD" title="In their words" aside="— colleagues, managers & teammates"`, right slot = derived count `N ON FILE — SHEET p / P` (mono 11px 0.14em muted, JS-updated, hidden ≤640 per WorkSheet precedent — design wraps it above bars on mobile instead: keep visible, moved in footer on mobile).

Carousel (reference `screens/6a-in-their-words.html`):

- [ ] Server-render cards newest-first into page containers of 6 (3×2 grid, panel bg, `--line` outer border, internal dividers: `border-right` cols 1–2, `border-bottom` row 1). Card anatomy per design: meta row (`NO. 0NN` | `MM / YYYY`, mono 9px 0.16em faint), quote (serif italic 18px lh 1.5 flex:1, wrapped in curly quotes), signature block (name serif italic 19px over role mono 9px 0.12em muted, top border `color-mix(ink 25%)`), optional stamp (mono 8.5px 0.18em accent, accent-65% border, `5px 9px`, rotation cycle).
- [ ] Track: `overflow-x auto` + `scroll-snap-type: x mandatory`, pages `scroll-snap-align: start`, scrollbar hidden. No-JS fallback = natively scrollable.
- [ ] Arrows: 40px circles overhanging ±20px, active/inactive states per spec (inactive: `--bg`, ink-20% border, deep-faint glyph, `disabled`); footer row: `NEWEST FIRST — NO. 0NN AND COUNTING` left; right: per-page 26px indicator bars (2px top-border buttons, active accent; 18px ≤640) + `SWIPE, DRAG, OR ← →`.
- [ ] Client `<script>`: chunk cards responsively (6/page >900, 4/page 641–900 as 2×2, 1/page ≤640) via matchMedia, rebuild indicators; arrows + indicator clicks scroll (`behavior: reduced ? "auto" : "smooth"`); scroll listener syncs current page (rAF-throttled), updates count line + arrow disabled state; mouse drag via pointer events (suppress click after drag); ArrowLeft/Right at document level guarded by no-modifier + not-typing + section-in-view bounding-rect check (house pattern from `hero.ts`); `aria-live="polite"` visually-hidden page announcement.
- [ ] Mobile (≤640): 1 card/page; count line wraps above bars in footer.
- [ ] Verify: build + preview (snapshot, arrows, indicators, resize) — deferred to Task 9.

### Task 3: Soccer data (`src/data/soccer.ts`)

**Files:** Create `src/data/soccer.ts`.

**Produces:** the handoff data model verbatim (`League`, `Team`, `Season`, `Match` interfaces; `TEAMS: Team[]`, `SEASONS: Season[]`, `MATCHES: Match[]`).

- [ ] Teams: `charlie-cheers` (Charlie Cheers FC, NYC Footy, P4, 7v7 outdoor), `fa-blast` (FA Blast from the Past, NYC Footy, P3, 8v8 outdoor), `salmon-roe` (Salmon Roe United, Volo, 6v6 indoor — **no division ever**).
- [ ] Seasons: fall-2025 "Fall 2025" SEP — NOV sealed; winter-2025-26 "Winter 2025 – 26" NOV — FEB sealed; spring-2026 "Spring 2026" MAR — MAY sealed; summer-2026 "Summer 2026" JUN — AUG in-play.
- [ ] 24 matches. Summer's 6 are real (from the match-log screen): 06-01 CC W 2–1 1G; 06-08 CC L 1–3; 06-15 SR W 6–3 2G(min); 06-17 FA W 5–2 2G; 06-24 FA W 3–1 2G; 06-29 CC W 4–2 1G 1A. Sealed 18 are placeholders matching the design's per-season W/D/L square sequences (Fall: W L D W L; Winter: W W L D W L; Spring: W L W W D W L) and per-match G/A bars (Fall: 1G/0/2G+1A/0/1G; Winter: 0/2G†+1A/1G/0/2G+1A/1G; Spring: 1G+1A/0/2G/1G+1A/0/2G+1A/1G), invented plausible scores, team split noted `TODO(ethan)` backfill-from-Strava.
- [ ] `npx astro check` passes.

### Task 4: Derivations (`src/data/soccer-derive.ts`) + verification script

**Files:** Create `src/data/soccer-derive.ts`; throwaway check run (scratchpad, not committed).

**Produces (consumed by Tasks 5–8, palette, footer):**

```ts
export interface Agg {
    played: number;
    w: number;
    d: number;
    l: number;
    goals: number;
    goalsIsMin: boolean;
    assists: number;
}
export function sortedMatches(): Match[]; // date asc, stable
export function allTime(): Agg & { seasons: number };
export function seasonAgg(seasonId: string): Agg;
export function teamLines(seasonId: string): { team: Team; agg: Agg }[];
export function lastN(n: number): Match[]; // oldest→newest
export function currentStreak(): { kind: "W" | "D" | "L"; len: number };
export function longestStreak(pred: (m: Match) => boolean): number; // W streak, unbeaten run
export function goalsPerMatch(): string; // "1.04" (2 dp)
export function record(a: Agg): string; // "14–3–7" en dashes
export function goalsSuffix(
    scope: "team" | "season" | "all",
    agg: Agg,
    inPlay: boolean
): string; // "" | "†" | "+" | "+†"
export function teamById(id: string): Team;
export function seasonById(id: string): Season;
export function matchesFor(seasonId?: string): Match[];
export function chipFormat(team: Team): string; // "7V7 · OUTDOOR"
export function logFormat(team: Team): string; // "NYC FOOTY · P4 · 7V7 OUT" / "VOLO · 6V6 INDOOR"
export function logDate(iso: string): string; // "JUN 08"
```

Suffix rule (from design examples): team-scope `†` if min; season-scope `+` if in-play else `†` if min; all-time `+` if any in-play season has matches, plus `†` if any min anywhere.

- [ ] Implement; verify with a throwaway node script asserting every Global-Constraints aggregate; delete script after. `npx astro check` passes.

### Task 5: Field report shell — header, FIG. A1, tiles, FORM strip, footnote

**Files:** Create `src/components/field-report/FieldReportSheet.astro`, `src/components/field-report/PitchFig.astro`; modify `src/pages/index.astro` (render after TestimonialsSheet).

- [ ] `<section id="field-report" class="sheet hairline-top" aria-label="Field report">`. Custom header (not SectionHeader — FIG A1 needs `align-items: flex-start`): left baseline group `.kicker` `APPENDIX A` + h2 `Field report` + serif-italic aside (exact subtitle), right `PitchFig` 170px; margin-bottom 28. Mobile: fig below header, full-width max 200px.
- [ ] `PitchFig.astro`: SVG geometry copied verbatim from the design screen (viewBox 0 0 280 180; touchline, halfway, center r23+spot, penalty areas 41.5×101, goal areas 13.8×46, spots, arcs `A 23 23` bulging outward only, corner arcs, external goals), strokes → `var(--fr-grey)` 1px, goals `var(--fr-deep)`, spots `var(--fr-accent2)`; caption row `FIG. A1 — THE OFFICE` | `N.T.S.` (mono 8px 0.14em faint); `role="img"` + descriptive label.
- [ ] Section-local theme props on `.sheet` + `:global([data-theme="light"])` overrides, contrast-audited: `--fr-grey` (handoff #635E57 / light #B3A48D), `--fr-deep` (#4A443C / #C9BCA5), `--fr-ink2` (#C9BFB0 / dark-on-light analog), `--fr-accent2` (#C69254 / light analog). Nudge any that fail (3:1 graphics, 4.5:1 text) with handoff originals in comments.
- [ ] Tile row (grid `1fr 1fr 1.4fr 1fr 1fr`, panel, `--line` border, col dividers ink-10%): five `<button>` tiles — SEASONS / MATCHES / RECORD — W·D·L / GOALS / ASSISTS — label mono 9px 0.16em + value serif 52px, values derived (`04`, `24`, `14–3–7`, `25` + sup `+†` accent 28px, `07`, zero-padded 2). Active: label accent + `● VIEWING`, bg accent-8%, 2px accent top border `margin-top:-1px`; inactive: label faint, value `--fr-ink2`, transparent top border, hover accent-4%. `aria-pressed` + `aria-controls`. Mobile: horizontally scrollable strip.
- [ ] FORM strip (always visible; bordered row, no top border, `11px 24px`, mono 9.5px 0.14em): `FORM` faint · six 13px squares (last 6: W solid accent, D solid `--fr-grey`, L 1px `--fr-grey` outline) with visually-hidden text alternative · `LAST 6` muted · divider · `STREAK` + value accent · divider · `GOALS / MATCH` + value ink · spacer · right note `RECOMPUTED EVERY MATCH — NEVER HAND-EDITED` (var(--faint); deviation comment). Mobile: wraps to two lines, right note drops.
- [ ] View container `<div class="fr-views">` hosting Tasks 6–8 panels (`hidden` except active) + footnote row (mono 9px 0.12em faint, space-between): left `† MINIMUM — LOST COUNT MID-CELEBRATION.`, right label swapped per view by JS.
- [ ] `npx astro check` passes; commit shell + Tasks 3–4 files.

### Task 6: Season ledger + match log views

**Files:** Create `src/components/field-report/SeasonLedger.astro`, `src/components/field-report/MatchLog.astro`.

- [ ] **Ledger (default view):** bordered block (no top). Active season header (accent-6% bg, 2px accent left border): `SUMMER 2026 ● IN PLAY` mono 10px accent · `JUN — AUG · 3 TEAMS · 6 MATCHES SO FAR` mono 9px faint · spacer · `5–0–1 · 8+ G · 1 A` mono 9.5px muted — all derived. Team rows grid `1fr 330px 44px 90px 48px 44px` gap 16 pad `13px 24px`: serif 17px name · chip group (league chip muted/ink-18% border; division chip accent/accent-40% border NYC Footy only; format chip faint/ink-10% border) · right-aligned mono 10.5px P / W–D–L / G (ink, `†` accent2 when min) / A (em-dash faint when 0). Sealed rows (mono buttons, full-row, hover accent-3%): label muted · `MAR — MAY · 2 TEAMS · 7 MATCHES · SEALED` faint · spacer · `4–1–2 · 7 G · 3 A — EXPAND ▸` faint; expanding reveals that season's team rows inline (300ms grid-rows accordion, instant under reduced motion), glyph ▸→▾ + word EXPAND→COLLAPSE, `aria-expanded`; multiple may be open. Mobile: chips wrap under name; numbers stay right.
- [ ] **Match log:** filter bar (bordered row `13px 24px` mono 9.5px 0.14em): `FILTER` faint + three dropdown chips (SEASON — default `SUMMER 2026` — LEAGUE ALL, TEAM ALL; active-filter chip accent text/accent-50% border, inactive muted/`--line`, hover brightens) + spacer + derived `SHOWING 6 OF 24 · NEWEST FIRST`. Dropdowns: button + absolutely positioned mono listbox panel (panel bg, `--line` border), Esc/outside-click close, `aria-expanded` + `aria-haspopup="listbox"`, options from data. Log table: header mono 9px faint row + rows grid `92px 1fr 250px 70px 84px 48px 48px` gap 16 pad `14px 24px`: date mono 10.5 muted · team serif 17 · league string mono 9px muted · result centered (W accent / D muted / L faint) · score right muted · G/A right (ink >0 with accent2 `†` when min, faint em-dash 0). Rows carry `data-season/-league/-team`; JS filters + updates count. Pagination row (`EARLIER MATCHES ↓` muted · dashed rule · `18 MORE ACROSS 3 SEALED SEASONS` faint): visible only when season filter = current season and other filters ALL; click ⇒ season → ALL. Mobile: league column folds under team name as second line.
- [ ] `npx astro check` passes; commit.

### Task 7: FIG. A3 charts + FIG. A4 record view

**Files:** Create `src/components/field-report/GoalsChart.astro`, `src/components/field-report/RecordView.astro`.

- [ ] **GoalsChart** frontmatter computes all SVG geometry from `sortedMatches()` (screens `13b`/`14c`/`14b` are the geometry reference): header row `FIG. A3 — GOALS & ASSISTS` accent + scale toggle chips (`CUMULATIVE | BY SEASON | PER MATCH`, active accent text + accent-8% bg, `aria-pressed`) + legend (18px 2px swatch lines) + per-match-only `SEASON: ALL ▾` dropdown. Chart panel: `--line` border, panel bg, 40px `grid-bg`-style backdrop, `padding 20px 24px 10px`.
    - Cumulative (viewBox 1080×236): gridlines every 5 up to next-5 max (y = 200 − v·190/maxTick), x = 40 + i·(1020/N); step paths (H then V at scoring matches, 2px; goals `--accent`, assists `--fr-grey`), end dots + labels (`25+† G`, `7 A`), `†` marks accent2 at min points, season dashed dividers `--fr-deep` + labels (current muted + `●`, sealed faint).
    - By season (1080×216): points per season at x = 40 + 1020(s+.5)/S, y ticks 0/mid/max; polylines 2px, 3–3.5px dots, value labels (goals above accent w/ suffix; assists offset right muted); x labels `FALL '25 · 2–1–2` (current accent-muted + `●`).
    - Per match (1080×162): paired bars from baseline 110 (goals center−11, assists center+1, 10px wide; height 34/unit); blank matches 2px `var(--faint)` tick crossing baseline; y ticks 1/2; dashed season dividers + labels; 5 pre-rendered variants (ALL + per season) toggled by the dropdown.
    - Scale-specific explainer rows under panel (left copy per screen; right `† COUNT UNCERTAIN — DRAWN AT MINIMUM` only where the screen shows it, per-match right = legend line `AMBER — GOALS · GREY — ASSISTS · TICKS ON THE LINE — PLAYED, BLANK`).
    - Series colored via classes (`.s-goals`/`.s-assists`) so `[data-emphasis="assists"]` (ASSISTS tile) swaps emphasis in CSS — one accent at a time.
    - Mobile: panel `overflow-x: auto` with min-width SVG.
- [ ] **RecordView** (screen `13c` minus its bottom summary row — that's the FORM strip): legend row (WIN/DRAW/LOSS 12px swatches) then panel: per-season square groups (22px squares gap 6, same W/D/L coding, visually-hidden text per season), label `FALL '25 — 2·1·2` mono 8.5px (current accent + `● IN PLAY`), right `CURRENT STREAK` + serif 40px value; second bordered row (no top) with mono stat pairs `LONGEST W STREAK` / `UNBEATEN RUN` derived. Mobile: groups wrap.
- [ ] `npx astro check` passes; commit.

### Task 8: View-switch script + palette `field` query + footer record

**Files:** Create `src/components/field-report/field-report.ts` (+ import shim `<script>` in FieldReportSheet); modify `src/components/palette/PaletteMount.astro`, `src/components/Footer.astro`.

- [ ] `field-report.ts`: init-guarded on `#field-report`; local `$` helper + data attributes (`[data-fr-tile]`, `[data-fr-view]`, `[data-fr-expand]`, `[data-fr-filter]`, `[data-fr-scale]`…). Tile click → swap `hidden` on views (only the ledger area moves), sync `aria-pressed`/`● VIEWING` span, set `data-emphasis` for ASSISTS, swap footnote right label (from a `Record<view, string>`); sealed-season accordion; match-log filters + count + pagination; chart scale + per-match season dropdown; all dropdown menus share one outside-click/Esc closer; visually-hidden `aria-live="polite"` view announcement (house palette-count pattern).
- [ ] Palette: extend `paletteData` with `field: { lines: string[], summary: string }` from derivations; add `kind: "field"` entries shown when the query fuzzy-matches `field report` (group label `FIELD REPORT`, `⚽`-free mono rows, ↵ scrolls to `/#field-report`). Keep existing entries untouched.
- [ ] Footer: append `<span class="ext"> · {record} this summer</span>` (derived current-season record) to the copyright cell.
- [ ] `npx astro check`; commit.

### Task 9: Build, preview verification, contrast audit, light theme, review

- [ ] `npx astro build` clean; `npm run format`.
- [ ] Preview server: verify both sections dark + light (`data-theme`), all five views, carousel paging/keyboard/drag, filters, accordions, mobile 390 + 768 layouts, reduced-motion jump, no console errors; screenshot proof.
- [ ] Contrast: verify all new color pairs (script over the section-local props) — nudge failures.
- [ ] Adversarial multi-lens review (workflow): design fidelity vs handoff, derivation correctness, a11y, conventions; fix confirmed findings; final commit.
