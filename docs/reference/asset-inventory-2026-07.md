# Asset Inventory — Portfolio-Website

## `/Users/ethanratnofsky/Projects/Portfolio-Website/src/images/` (main image dir)

| File | Type | Dimensions | Size on disk |
|---|---|---|---|
| playlist_bridge.png | PNG | 2880 × 1578 | 5,358,270 B (5.36 MB) |
| flopaholic.png | PNG | 3024 × 1666 | 1,500,515 B (1.50 MB) |
| flopaholic2.png | PNG | 3024 × 1666 | 1,498,875 B (1.50 MB) |
| changeplusplus_logo.png | PNG | 4267 × 4267 | 970,596 B (0.97 MB) |
| portfolio_website.png | PNG | 3024 × 1666 | 433,970 B (434 KB) |
| house_vandy3.png | PNG | 2264 × 630 | 391,567 B (392 KB) |
| house_vandy.png | PNG | 3024 × 1666 | 266,877 B (267 KB) |
| revu4.png | PNG | 1242 × 2688 | 240,120 B (240 KB) |
| revu2.png | PNG | 1242 × 2688 | 226,665 B (227 KB) |
| revu.png | PNG | 1242 × 2688 | 225,531 B (226 KB) |
| revu3.png | PNG | 1242 × 2688 | 181,082 B (181 KB) |
| house_vandy2.png | PNG | 2900 × 414 | 71,887 B (72 KB) |
| cartoon_ethan.svg | SVG | vector (viewBox 3733 × 4201) | 46,248 B (46 KB) |
| logo_signature.svg | SVG | vector (viewBox 1846 × 280) | 19,806 B (20 KB) |
| abbvie_logo.jpg | JPG | 200 × 200 | 3,259 B (3.3 KB) |
| kinetik_logo.png | PNG | 225 × 225 | 3,219 B (3.2 KB) |
| github.svg | SVG | vector (24 × 24) | 862 B |
| linkedin.svg | SVG | vector (24 × 24) | 648 B |
| external_link.svg | SVG | vector (24 × 24) | 467 B |
| gmail.svg | SVG | vector (24 × 24) | 380 B |

**Subtotal: 11,440,844 B (~11.4 MB)**

### SVG contents
- **logo_signature.svg** — handwritten "Ethan Ratnofsky" signature logo. Structure: `<g id="signature">` containing exactly **2 `<path>` elements** (`id="first-name"`, `id="last-name"`), zero `stroke` or `fill` attributes anywhere — the pen strokes are **filled outline shapes** (default black fill), not stroked centerlines. Fade/scale/color animation is trivial (recolor via `fill` on the paths); a stroke-dashoffset "handwriting draw-on" animation is **not directly possible** without converting to stroked paths or using an animated mask.
- **cartoon_ethan.svg** — large Illustrator-exported cartoon avatar illustration of Ethan (dozens of classed styles, clip-paths, filled + stroked shapes; 46 KB, worth an SVGO pass).
- **external_link.svg** — icons8 external-link icon, single filled path.
- **github.svg / gmail.svg / linkedin.svg** — Simple Icons social marks (GitHub octocat, Gmail envelope, LinkedIn), one filled path each.

## `/Users/ethanratnofsky/Projects/Portfolio-Website/src/images/gallery/` — only 2 images

| File | Type | Dimensions | Size on disk |
|---|---|---|---|
| COVIDSZNPhotography.jpg | JPG | 3024 × 4032 | 1,513,755 B (1.51 MB) |
| NinjaNahteyLogo2017.jpg | JPG | 3000 × 3000 | 172,082 B (172 KB) |

**Subtotal: 1,685,837 B (~1.69 MB)**

- **COVIDSZNPhotography.jpg** — portrait photo of a masked photographer (maroon "Colorado Vail" long-sleeve, olive pants) standing on a tree-lined park promenade, aiming a DSLR straight at the viewer; full-resolution phone photo.

## `/Users/ethanratnofsky/Projects/Portfolio-Website/public/` (favicons/PWA icons)

| File | Type | Dimensions | Size on disk |
|---|---|---|---|
| android-chrome-512x512.png | PNG | 512 × 512 | 19,930 B (20 KB) |
| favicon.ico | ICO | 48 × 48 | 15,406 B (15 KB) |
| android-chrome-192x192.png | PNG | 192 × 192 | 10,191 B (10 KB) |
| apple-touch-icon.png | PNG | 180 × 180 | 9,323 B (9.3 KB) |
| favicon-32x32.png | PNG | 32 × 32 | 1,086 B |
| favicon-16x16.png | PNG | 16 × 16 | 481 B |

**Subtotal (images only): 56,417 B (~56 KB)** — plus non-image `index.html` (1,320 B), `manifest.json` (396 B), `robots.txt` (67 B). All appropriately sized; no optimization needed.

## `/Users/ethanratnofsky/Projects/Portfolio-Website/src/docs/`

| File | Type | Dimensions | Size on disk |
|---|---|---|---|
| EthanRatnofskyResume.pdf | PDF | — | 119,723 B (120 KB) |

**Subtotal: 119,723 B (~120 KB)** — resume path: `/Users/ethanratnofsky/Projects/Portfolio-Website/src/docs/EthanRatnofskyResume.pdf`.

## `/Users/ethanratnofsky/Projects/Portfolio-Website/docs/handoff/design_handoff_portfolio_redesign/src/images/`

| File | Type | Dimensions | Size on disk |
|---|---|---|---|
| flopaholic.png | PNG | (dup of src) | 1,500,515 B |
| gallery/COVIDSZNPhotography.jpg | JPG | (dup of src) | 1,513,755 B |
| gallery/NinjaNahteyLogo2017.jpg | JPG | (dup of src) | 172,082 B |
| portfolio_website.png | PNG | (dup of src) | 433,970 B |
| house_vandy.png | PNG | (dup of src) | 266,877 B |
| house_vandy2.png | PNG | (dup of src) | 71,887 B |
| revu2.png | PNG | (dup of src) | 226,665 B |
| logo_signature.svg | SVG | vector | 19,768 B |
| logo_signature_amber.svg | SVG | vector (recolored variant) | 19,783 B |
| logo_signature_bronze.svg | SVG | vector (recolored variant) | 19,783 B |
| logo_signature_ink.svg | SVG | vector (recolored variant) | 19,783 B |
| logo_signature_ivory.svg | SVG | vector (recolored variant) | 19,783 B |

**Subtotal: 4,284,651 B (~4.28 MB)** — all rasters are byte-identical copies of `src/images` files; only new assets are 4 recolored signature variants (amber/bronze/ink/ivory).

## Heaviest offenders (optimization targets)

1. `src/images/playlist_bridge.png` — **5.36 MB**, 2880 × 1578 (screenshot stored as PNG; → WebP/AVIF + responsive sizes)
2. `src/images/gallery/COVIDSZNPhotography.jpg` — **1.51 MB**, 3024 × 4032 (full-res phone photo)
3. `src/images/flopaholic.png` — **1.50 MB**, 3024 × 1666
4. `src/images/flopaholic2.png` — **1.50 MB**, 3024 × 1666
5. `src/images/changeplusplus_logo.png` — **0.97 MB**, 4267 × 4267 (a logo at absurd resolution; likely displayed <300px)
6. `src/images/portfolio_website.png` — 434 KB, 3024 × 1666
7. `src/images/house_vandy3.png` — 392 KB, 2264 × 630
8. `src/images/house_vandy.png` — 267 KB, 3024 × 1666
9. `src/images/revu4.png` / `revu2.png` / `revu.png` / `revu3.png` — 181–240 KB each, 1242 × 2688 phone screenshots

## Total weight per directory

| Directory | Total |
|---|---|
| src/images (excl. gallery) | 11.44 MB |
| src/images/gallery (2 images only) | 1.69 MB |
| src/docs | 0.12 MB |
| public (images) | 0.06 MB |
| docs/handoff/.../src/images (duplicates) | 4.28 MB |
| **Shipped app assets (src/images + gallery + docs + public)** | **~13.3 MB** |

Notes: virtually all weight is oversized PNG screenshots and two full-res JPGs; every raster except the tiny logos/favicons exceeds 1200px on its long edge. The handoff directory adds no unique rasters. Gallery currently contains only 2 images, so the gallery pipeline can start simple but should assume growth.
