/* Generates the favicon set and the Open Graph share card from brand assets:
   - Type is drawn as real Instrument Serif / IBM Plex Mono glyph outlines
     (extracted with fontkit from the self-hosted @fontsource woff2 files),
     so output never depends on system-installed fonts.
   - The signature comes from src/assets/brand/logo_signature.svg.

   Run: node scripts/generate-brand-assets.mjs
   Outputs: public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png, public/og.png */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as fontkit from "fontkit";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pub = (f) => path.join(root, "public", f);

const COLORS = {
    bg: "#171310",
    ink: "#F0E8DA",
    muted: "#9A8C7B",
    accent: "#D9A05B",
    dash: "rgba(217, 160, 91, 0.6)",
    grid: "rgba(240, 232, 218, 0.045)",
};

const serif = fontkit.openSync(
    path.join(root, "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2"),
);
const mono = fontkit.openSync(
    path.join(root, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"),
);

/** Lay out text as SVG path data. Returns per-glyph paths so callers can color
    individual glyphs (e.g. the accent period). tracking is em-relative. */
function layoutText(font, text, size, tracking = 0) {
    const scale = size / font.unitsPerEm;
    const run = font.layout(text);
    const glyphs = [];
    let x = 0;
    for (let i = 0; i < run.glyphs.length; i++) {
        const d = run.glyphs[i].path.scale(scale, -scale).translate(x, 0).toSVG();
        glyphs.push({ d, char: text[Math.min(i, text.length - 1)] });
        x += run.positions[i].xAdvance * scale + tracking * size;
    }
    return { glyphs, width: x - tracking * size, ascent: font.ascent * scale, capHeight: font.capHeight * scale };
}

const toPaths = (laid, fill, accentLast = false) =>
    laid.glyphs
        .map((g, i) => {
            const color = accentLast && i === laid.glyphs.length - 1 ? COLORS.accent : fill;
            return `<path d="${g.d}" fill="${color}"/>`;
        })
        .join("");

/* ---------- favicon.svg: dashed spec box + "E." in Instrument Serif ---------- */

const E = layoutText(serif, "E.", 38);
const ex = (64 - E.width) / 2;
const ey = 32 + E.capHeight / 2; // optically center on cap height
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="10" fill="${COLORS.bg}"/>
<rect x="7.5" y="7.5" width="49" height="49" fill="none" stroke="${COLORS.dash}" stroke-width="1.5" stroke-dasharray="4 3"/>
<g transform="translate(${ex.toFixed(2)}, ${ey.toFixed(2)})">${toPaths(E, COLORS.ink, true)}</g>
</svg>`;
writeFileSync(pub("favicon.svg"), faviconSvg);

/* ---------- raster favicons ---------- */

const png = (size) => sharp(Buffer.from(faviconSvg), { density: 300 }).resize(size, size).png().toBuffer();
writeFileSync(pub("favicon.ico"), await pngToIco([await png(16), await png(32), await png(48)]));
// Apple touch icons get rounded by the OS — ship it square-cornered.
const touchSvg = faviconSvg.replace('rx="10"', 'rx="0"');
await sharp(Buffer.from(touchSvg), { density: 300 }).resize(180, 180).png().toFile(pub("apple-touch-icon.png"));

/* ---------- og.png (1200×630): the hero moment as a share card ---------- */

const W = 1200;
const H = 630;
const GRID = 56;

let gridLines = "";
for (let gx = GRID; gx < W; gx += GRID) gridLines += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${COLORS.grid}" stroke-width="1"/>`;
for (let gy = GRID; gy < H; gy += GRID) gridLines += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${COLORS.grid}" stroke-width="1"/>`;

const kicker = layoutText(mono, "SOFTWARE ENGINEER — NEW YORK", 17, 0.22);
const name = layoutText(serif, "Ethan Ratnofsky.", 96);
const tagline = layoutText(mono, "DRAWN BY CODE, APPROVED BY HAND — ETHANRATNOFSKY.COM", 14, 0.12);

// Dashed spec box around the name, padding 18×34 like the hero.
const nx = (W - name.width) / 2;
const ny = 330;
const boxPad = { x: 34, y: 30 };
const box = {
    x: nx - boxPad.x,
    y: ny - name.capHeight - boxPad.y,
    w: name.width + boxPad.x * 2,
    h: name.capHeight + boxPad.y * 2 + 14, // room for the period's descent below baseline
};

// Signature (amber) bottom-center, drawn from the real logo paths.
const sigSrc = readFileSync(path.join(root, "src/assets/brand/logo_signature.svg"), "utf8");
const sigPaths = [...sigSrc.matchAll(/<path[^>]*d="([^"]+)"/g)].map((m) => m[1]);
// The source paths sit in a translated group — carry the offset over.
const sigOffset = sigSrc.match(/transform="translate\(([-\d.]+)[ ,]([-\d.]+)\)"/);
const sigTranslate = sigOffset ? `translate(${sigOffset[1]} ${sigOffset[2]})` : "";
const sigScale = 240 / 1846.49;
const sigX = (W - 240) / 2;
const sigY = 480;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${COLORS.bg}"/>
${gridLines}
<g transform="translate(${(W - kicker.width) / 2}, 178)">${toPaths(kicker, COLORS.accent)}</g>
<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="none" stroke="${COLORS.dash}" stroke-width="1.5" stroke-dasharray="7 6"/>
<g transform="translate(${nx}, ${ny})">${toPaths(name, COLORS.ink, true)}</g>
<g transform="translate(${sigX}, ${sigY}) scale(${sigScale}) ${sigTranslate}">${sigPaths.map((d) => `<path d="${d}" fill="${COLORS.accent}"/>`).join("")}</g>
<g transform="translate(${(W - tagline.width) / 2}, 590)">${toPaths(tagline, COLORS.muted)}</g>
</svg>`;

await sharp(Buffer.from(ogSvg), { density: 144 }).resize(W, H).png().toFile(pub("og.png"));

console.log("✓ favicon.svg, favicon.ico, apple-touch-icon.png, og.png generated");
