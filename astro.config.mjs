// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output for GitHub Pages; www is canonical (Cloudflare 301s apex → www).
// CNAME lives in public/ and must match the Pages custom domain to avoid a
// www↔apex redirect loop.
export default defineConfig({
    site: "https://www.ethanratnofsky.com",
    trailingSlash: "never",
    integrations: [sitemap()],
});
