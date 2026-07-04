/* WCAG contrast audit for the design tokens. Parses src/styles/tokens.css and
   reports the contrast ratio of every text-role token against every surface
   token, per theme. AA thresholds: 4.5:1 normal text, 3:1 large text (≥24px
   or ≥18.66px bold).

   Run: node scripts/check-contrast.mjs */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const css = readFileSync(path.join(root, "src/styles/tokens.css"), "utf8");

const parseBlock = (selector) => {
    const match = css.match(new RegExp(`${selector.replace(/[[\]"=]/g, "\\$&")}\\s*{([^}]*)}`));
    const vars = {};
    if (!match) return vars;
    for (const m of match[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
    return vars;
};

const dark = parseBlock(":root");
const light = { ...dark, ...parseBlock('[data-theme="light"]') };

const luminance = (hex) => {
    const n = hex.replace("#", "");
    const ch = (i) => {
        const c = parseInt(n.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
};

const ratio = (fg, bg) => {
    const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    return (l1 + 0.05) / (l2 + 0.05);
};

const TEXT_ROLES = ["ink", "muted", "faint", "tag", "accent", "accent-hover"];
const SURFACES = ["bg", "panel", "card"];

for (const [name, theme] of [["DARK", dark], ["LIGHT", light]]) {
    console.log(`\n=== ${name} ===`);
    for (const role of TEXT_ROLES) {
        const fg = theme[role];
        if (!fg?.startsWith("#")) continue;
        const cells = SURFACES.map((s) => {
            const r = ratio(fg, theme[s]);
            const mark = r >= 4.5 ? "✓" : r >= 3 ? "△" : "✗";
            return `${s} ${r.toFixed(2)}${mark}`;
        });
        console.log(`${role.padEnd(13)} ${fg}  ${cells.join("   ")}`);
    }
    // Button text on accent surface
    const btn = ratio(theme["accent-contrast"], theme["accent"]);
    console.log(`btn text on accent: ${btn.toFixed(2)}${btn >= 4.5 ? "✓" : btn >= 3 ? "△" : "✗"}`);
}
console.log("\n✓ ≥4.5 (AA normal)  △ ≥3 (AA large text only)  ✗ fails");
