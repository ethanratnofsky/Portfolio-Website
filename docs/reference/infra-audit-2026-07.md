# Portfolio-Website Build/Deploy/Infra Audit

**Repo:** `/Users/ethanratnofsky/Projects/Portfolio-Website` — React 18 + Webpack 5, deployed to GitHub Pages via `gh-pages`.
**Environment:** Node v25.8.1, npm 11.11.0 (very new Node against a 2022-era toolchain: webpack 5.74, webpack-cli 4, babel-loader 8, gh-pages 4).

---

## 1. Webpack Config (`webpack.config.js`)

| Aspect | State |
|---|---|
| Entry | `./src/index.js` (single entry) |
| Output | `dist/bundle.js` — **fixed filename, no content hash** |
| Mode | `production` if `NODE_ENV === "production"` else `development` (build script sets it: `NODE_ENV='production' webpack`) |
| JS | `babel-loader` on `.js` (excl. `node_modules`); presets `@babel/preset-env` + `@babel/preset-react` inline in `package.json`. **No `.jsx` test** — only `.js` files are transpiled |
| CSS | `style-loader` + `css-loader` — CSS is injected via JS at runtime; **no `MiniCssExtractPlugin`**, so no separate CSS file, no CSS caching, flash-of-unstyled risk |
| SVG | `@svgr/webpack` (as React components, `svgo: false`, `titleProp: true`) — only for SVGs imported from `.js/.jsx/.ts/.tsx`; no rule for SVGs referenced from CSS |
| Images/PDF | `file-loader` (deprecated in webpack 5; asset modules are the modern replacement) → `assets/images/` with `[name].[ext]` — **no hashing**, and PDFs land in an "images" folder |
| Plugins | Only `HtmlWebpackPlugin` (template `public/index.html`, favicon `public/favicon.ico`) |
| Dev server | `historyApiFallback: true` only. No port set → defaults to **8080**, but README says open **localhost:3000** (mismatch) |

**Production optimizations:**
- Present (implicitly via `mode: "production"`): Terser minification, tree shaking, scope hoisting.
- Absent: content hashing (`[contenthash]`), code splitting / `splitChunks` (vendor + app in one `bundle.js`), CSS extraction/minification, `publicPath`, source maps, `CopyWebpackPlugin`, bundle analysis, `output.clean: true` (stale files can accumulate in `dist`).

**Critical gap — static assets never reach `dist`:** there is no copy step, so `public/manifest.json`, `public/robots.txt`, and all the PNG favicons (`android-chrome-*.png`, `apple-touch-icon.png`, `favicon-16x16/32x32.png`) are **not built or deployed**. Only `favicon.ico` ships (via `HtmlWebpackPlugin`'s `favicon` option). Confirmed by the gh-pages branch contents (see §3).

## 2. HTML / SEO State (`public/index.html`)

- **Title:** `Ethan Ratnofsky`
- **Present:** `charset`, `viewport`, `theme-color` (#000000), `description`, `keywords` (ignored by modern search engines).
- **Missing:** all Open Graph tags (`og:title/description/image/url/type`), all Twitter Card tags, `<link rel="canonical">`, `<link rel="manifest">` (manifest.json exists but is **never linked**), structured data, `lang`-appropriate social preview image.
- **Favicons:** six `<link>` tags, but five point at PNG files that are never copied to `dist` → **404 in production**. Also, hrefs are relative (`href="favicon-32x32.png"`), which breaks on nested routes (`/projects/favicon-32x32.png`).
- **Manifest (`public/manifest.json`):** valid-ish PWA manifest (name, icons=favicon.ico only, standalone, colors) plus a non-standard `homepage` key; not linked, not deployed — effectively dead.
- **robots.txt:** permissive (`User-agent: * / Disallow:`) — fine, but also **not deployed** (missing from gh-pages branch). No sitemap reference.

## 3. Deploy

**Flow:** `npm run deploy` → `predeploy` runs `NODE_ENV='production' webpack` → `gh-pages -d dist` force-publishes `dist/` to `origin/gh-pages`. Manual, from the local machine — **no CI/CD** (`.github/` does not exist).

**gh-pages branch contents:** `CNAME`, `assets/`, `bundle.js`, `bundle.js.LICENSE.txt`, `favicon.ico`, `index.html`. Last commit: `7f148ce` — **"Create CNAME", Dec 13 2022**, i.e. the CNAME was added via the GitHub UI *on top of* the last deploy; the site hasn't been redeployed since (or at least the branch tip is 2.5+ years old).

**CNAME situation:** the deployed CNAME contains **`www.ethanratnofsky.com`** — matching `package.json` `homepage` and the README, not the apex `ethanratnofsky.com` the user describes. GitHub Pages serves the domain in CNAME and redirects the other only if DNS is set up for both (apex A/ALIAS records + www CNAME record). If the user is canonically on the apex, the repo config (homepage, CNAME, README) all disagree with reality.

**Deploy-will-break-the-domain trap:** because CNAME lives only on the gh-pages branch (added via UI) and there is no `CNAME` file in `public/` or `dist/`, the **next `npm run deploy` will wipe the CNAME** (gh-pages replaces branch contents), detaching the custom domain. Fix: add `CNAME` to the build output (copy from `public/`) or use `gh-pages`'s `--add`/CNAME support.

**SPA routing fallback:** **no `404.html`** in `public/` or on gh-pages. With React Router v6 doing client-side routing, any deep link or hard refresh on a non-root route (e.g. `/projects`) returns GitHub's 404 page. Needs the standard 404.html-redirect hack (or HashRouter).

**Branch oddity:** local work is on `main` (recent commits incl. `37025f0`), but the remote only has `origin/master` (default) and `origin/gh-pages` — **`main` is not pushed**; local `master` also exists. Source-of-truth branch state is confusing and local commits are not backed up to the remote.

## 4. Repo Hygiene

- **`.gitignore` diff (uncommitted):** appends two lines at the end —
  ```
  # handoff docs
  docs/handoff
  ```
  Otherwise a standard CRA-style ignore (node_modules, /coverage, dist, .DS_Store, .env.*.local, debug logs).
- **Prettier:** `.prettierrc` — LF, semicolons, double quotes, tabWidth 4, ES5 trailing commas; `format` script covers js/jsx/css/md. But `prettier` is listed under **`dependencies`** instead of `devDependencies`.
- **Other notables:**
  - No lockfile check was requested, but no CI means builds/deploys depend entirely on one developer's machine (currently Node 25 vs. 2022 toolchain — untested combination).
  - License `ISC` in package.json with no LICENSE file.
  - README dev-server port (3000) doesn't match webpack-dev-server default (8080).
  - No tests, no lint config.

### Top action items
1. Add SPA `404.html` fallback and a `CNAME` file to the build output **before the next deploy** (deploying today would break the custom domain).
2. Copy `public/` static assets (manifest, robots.txt, PNG favicons) into `dist` (CopyWebpackPlugin) and link the manifest; or delete the dead files.
3. Reconcile apex vs. www across CNAME / `homepage` / README / DNS.
4. Add `[contenthash]` filenames, CSS extraction, and `output.clean`; migrate `file-loader` to asset modules.
5. Push/reconcile `main` vs `master`; consider a GitHub Actions deploy workflow.
