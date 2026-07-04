# Portfolio Rebuild — Approved Plan & Locked Decisions (July 2026)

The design source of truth is the Claude Design handoff bundle in `docs/handoff/design_handoff_portfolio_redesign/`
(git-ignored; analyzed in [design-handoff-analysis.md](design-handoff-analysis.md)). Concept: **"Compile the Draft"** —
the site as a live drafting board. Dark mode default, light mode via system preference + manual override.

## Stack (approved 2026-07-04)

| Area | Decision |
|---|---|
| Framework | Astro 5 + React islands, TypeScript strict |
| Styling | Handoff `tokens.css` custom properties + scoped component CSS (no framework) |
| Routing | File-based; home = sheets 01–06 with anchor nav; case studies at `/work/<slug>` |
| Motion | No library — CSS keyframes + small rAF timeline per the hero prototype |
| Content | Markdown content collections (Zod-typed); one file per project |
| Images | `astro:assets` build-time pipeline (AVIF/WebP, srcset, enforced dimensions) |
| Fonts | Self-hosted Instrument Serif (400/italic), Instrument Sans (400/500/600), IBM Plex Mono (400/500), `font-display: swap` |
| Hosting | GitHub Pages, apex `ethanratnofsky.com` canonical, deploy via GitHub Actions, CNAME baked into build |
| Forms | Formspree-style endpoint, placeholder until Ethan wires his account |
| Analytics | GoatCounter snippet, disabled until Ethan sets a site code |

## Locked content decisions

- Hero one-liner: *"Full-stack engineer in New York. I draft with a designer's eye, build with an engineer's hand — and refuse to lose a pixel in between."* (prototype version)
- Hero kicker: `SOFTWARE ENGINEER — NEW YORK` — included. **No employer name in the hero.**
- About: handoff bio copy verbatim; `FIGMA` skill chip stays; Kinetik appears in the EXPERIENCE — SPECIFICATION panel (incl. `2023 — NOW` row).
- Contact email: **placeholder** `hello@ethanratnofsky.com`, assembled in JS at click time, never in served HTML. Ethan swaps manually — marked with `TODO(ethan)`.
- Resume: existing `EthanRatnofskyResume.pdf` wired; Ethan replaces the file manually.
- Galleries: 2 real images (DES-014 Ninja Nahtey, FR-36 COVID SZN) + placeholder slots; Ethan adds Behance/Flickr exports manually.
- Case studies: House Vandy written; ReVU / Her Future Coalition / Portfolio Website get the "sheet queued" template.
- December snowflakes easter egg: retired (replaced by terminal, ⌘K, signature-replay easter eggs). Preserved in [content-inventory.md](content-inventory.md).
- Old content preserved verbatim in [content-inventory.md](content-inventory.md); flat-file rows keep numbering `006–009`.

## Handoff ambiguity resolutions

- Grid draw: hero gets per-line draw (prototype); other sections static background grid.
- Crosshair: 8px snap ships; chip offset +14/+14 with edge flip.
- Spec callout: absolute right of name box on desktop, below box under ~1200px.
- Signature draw: width-reveal (`max-width` 0→230px) — the SVG is filled outlines, true stroke-draw needs a retraced asset.
- Theme: `data-theme` attr, `localStorage` key `theme`; stored override beats system; keys: `theme`, `introPlayed` (sessionStorage).

## Do-not-do

- Never run the legacy `npm run deploy` (`gh-pages -d dist`) — it would wipe the CNAME on the gh-pages branch and detach the domain.
- Don't rewrite Ethan's bio copy or invent facts. Taste calls go to Ethan.
