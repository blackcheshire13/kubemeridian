# devopstech.net — site

VitePress site for [devopstech.net](https://devopstech.net). This file is excluded from the
site itself (`srcExclude` in `.vitepress/config.mts`).

## Local

```bash
cd docs
npm ci
npm run docs:dev      # http://localhost:5173
npm run docs:build    # -> .vitepress/dist
```

`vitepress preview` caches the file list when it starts: restart it after every rebuild.

Social cards (`public/og/*.png`) are drawn by hand and committed. The build fails when one is
missing, orphaned or stale, including after a change to `scripts/og-cards.mjs` or to the mark
files it reads (`public/favicon.svg`, `public/devopstech.svg`). Redraw them with:

```bash
CHROME_BIN=/path/to/chrome node scripts/og-cards.mjs
```

## Deploy — Cloudflare Pages

Project **`kubemeridian-docs`** (direct upload, not git-connected), custom domains
**devopstech.net** and **www.devopstech.net**. Deploy from the **repository root**, so the
Pages Functions in `functions/` (the `devopstech.net/ice` go-import) go up with the site:

```bash
npm ci --prefix docs && npm run build
CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> \
  npx wrangler@4 pages deploy docs/.vitepress/dist \
    --project-name=kubemeridian-docs --branch=main
```

Without `--branch=main`, wrangler uses the current git branch and the upload becomes a
preview, not production. Afterwards, check that
`curl 'https://devopstech.net/ice?go-get=1'` still returns the `go-import` meta tag.

`public/_redirects` sends the old KubeMeridian guide URLs (`/guide/*`) to the archive page.

Keep Cloudflare's **Email Address Obfuscation** off for the zone: it rewrites `mailto:` links
into `/cdn-cgi/l/email-protection#…`, which the VitePress router turns into the 404.

## The pilot form worker

`workers/pilot` receives the design-partner form on `devopstech.net/api/pilot` and mails it
through Cloudflare Email Routing. Deploy it with the verified destination address, which stays
out of the repository:

```bash
PILOT_TO=<verified-destination> CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=<account-id> \
  ./workers/pilot/deploy.sh
```
