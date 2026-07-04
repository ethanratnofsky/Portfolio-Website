// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output for GitHub Pages; apex domain is canonical (CNAME lives in public/).
export default defineConfig({
    site: "https://ethanratnofsky.com",
    trailingSlash: "never",
    integrations: [sitemap()],
});
