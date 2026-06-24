# KubeMeridian docs

VitePress documentation site for [devopstech.net](https://devopstech.net).

## Local

```bash
cd docs
npm install
npm run docs:dev      # http://localhost:5173
npm run docs:build    # -> .vitepress/dist
```

## Deploy — Cloudflare Pages (devopstech.net)

The domain is on Cloudflare. Create a Pages project connected to this repo:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | `docs` |
| Build command | `npm run docs:build` |
| Build output directory | `.vitepress/dist` |
| Node version | `20` (env var `NODE_VERSION=20`) |

Then add **devopstech.net** (and `www`) as a custom domain on the Pages project —
Cloudflare wires the DNS automatically since the zone is already on the account.

Every push to `main` redeploys. Preview deployments are created for PRs.

### Deployed

Live as Cloudflare Pages project **`kubemeridian-docs`** → `https://kubemeridian-docs.pages.dev`,
custom domains **devopstech.net** + **www.devopstech.net**.

Manual redeploy (direct upload, no git integration needed):

```bash
cd docs && npm ci && npm run docs:build
CLOUDFLARE_API_TOKEN=*** CLOUDFLARE_ACCOUNT_ID=0693bc7c634a68a6d5b824ec16668133 \
  npx wrangler@latest pages deploy .vitepress/dist \
    --project-name=kubemeridian-docs --branch=main --commit-dirty=true
```

(Or connect the GitHub repo in the Cloudflare Pages dashboard for push-to-deploy.)
