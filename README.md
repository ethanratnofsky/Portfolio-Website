# ethanratnofsky.com

Personal portfolio — the **"Compile the Draft"** redesign: the site as a live
drafting board. A terminal drafts the hero on load, a 56px grid cascades in,
the name snaps into a dashed spec box, a ruler measures it live, and the
signature inks as sign-off. Dark mode by default; light follows the system
with a manual override (`◐` in the nav, or `⌘K → Toggle theme`).

Live at [ethanratnofsky.com](https://ethanratnofsky.com). Design source of
truth: the handoff bundle in `docs/handoff/` (untracked); implementation
reference docs in [docs/reference/](docs/reference/).

## Stack

- [Astro 5](https://astro.build) + TypeScript (strict), fully static output
- No client framework — all interactivity (hero timeline, ⌘K palette,
  lightbox, form) is ~10 KB of vanilla TS
- Design tokens as CSS custom properties ([src/styles/tokens.css](src/styles/tokens.css))
- Self-hosted Instrument Serif / Instrument Sans / IBM Plex Mono (latin subsets)
- Build-time image pipeline (`astro:assets` → AVIF/WebP, responsive srcset)
- GitHub Pages via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))

## Development

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # serve the production build
npm run check      # type-check (astro check)
npm run format     # prettier
```

## Editing content

**Projects** live in [src/content/projects/](src/content/projects/) — one
markdown file each, validated by the schema in
[src/content.config.ts](src/content.config.ts). Every field beyond
`title`/`year`/`order`/`stackLabel` is optional and the layout degrades
gracefully: `cover` → image card, `textSheet` → text-sheet card,
`flatFileNo` → archive row, `study: written` + markdown body → full case
study, `study: queued` → "sheet queued" page. Add or remove a file and
everything (cards, counts, palette, prev/next) follows.

**Galleries**: drop an export into `src/assets/design/` or
`src/assets/photography/`, then add one entry in
[src/data/galleries.ts](src/data/galleries.ts) (plate numbering: `DES-0XX` /
`FR-XX`). Placeholder slots disappear as real images fill the row.

**Resume**: replace [public/EthanRatnofskyResume.pdf](public/EthanRatnofskyResume.pdf) (same filename).

**Pending wiring** (all marked `TODO(ethan)` in [src/data/site.ts](src/data/site.ts)):

1. `emailParts` — real address, split into parts (assembled in JS on click,
   never in served HTML); flip `emailIsPlaceholder` to `false`.
2. `formEndpoint` — create a [Formspree](https://formspree.io) form and paste
   its URL to enable the contact form (rendered disabled until then).
3. `goatcounter` — set a [GoatCounter](https://www.goatcounter.com) code to
   enable privacy-friendly, cookie-free analytics (off until then).

**Brand assets** (favicon set + OG share card are generated, not hand-drawn):

```sh
node scripts/generate-brand-assets.mjs
```

## Deploying

Every push to `main` builds and deploys via GitHub Actions. One-time repo
setup after merging the redesign:

1. Push `main` and make it the default branch (the old default was `master`).
2. Settings → Pages → **Source: GitHub Actions** (replaces the old `gh-pages`
   branch flow — do **not** run the legacy `gh-pages` deploy; it would clobber
   the custom domain).
3. Settings → Pages → Custom domain: `ethanratnofsky.com` (apex). DNS needs
   the four GitHub Pages A records for the apex and a `www` CNAME →
   `ethanratnofsky.github.io` (www then redirects to apex).

## Easter eggs

`R` replays the hero draft (so does clicking the footer signature). The hero
terminal takes commands after the draft finishes — try `help`, `whoami`, or
`sudo make-me-a-sandwich`. `⌘K` (or `$`) opens the palette anywhere.
