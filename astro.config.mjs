// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Static output for GitHub Pages; apex domain is canonical (CNAME lives in public/).
export default defineConfig({
    site: "https://ethanratnofsky.com",
    trailingSlash: "never",
    integrations: [react(), sitemap()],
});
