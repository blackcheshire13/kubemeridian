# Grafana catalog submission — runbook

How to publish **KubeMeridian** (`devopstech-kubemeridian-app`) to the Grafana
plugin catalog. Submission is a **web form in Grafana Cloud** (not a PR).

## Prerequisites (one-time)

1. **Make the repo public.** Community plugins require public source.
   ```bash
   gh repo edit blackcheshire13/kubemeridian --visibility public --accept-visibility-change-consequences
   ```
2. **Grafana Cloud account** under the org slug **`devopstech`** (it becomes the
   plugin-id prefix and is immutable). Free tier is fine.
3. **Access Policy token** — My Account → Security → Access Policies → realm = your
   org, scope = **`plugins:write`**. Keep it secret.

## Build, sign, package

```bash
npm ci && npm run build                      # -> dist/  (validator-clean)
npx @grafana/plugin-validator@latest <zip>   # sanity check (see below to make the zip)

# package the zip (dist/ renamed to the plugin id inside the archive)
bash scripts/package.sh                       # -> devopstech-kubemeridian-app.zip
```

**Sign** (community signature; run with your token — the token never leaves your machine):
```bash
GRAFANA_ACCESS_POLICY_TOKEN=<token> npm run sign
# re-package after signing so MANIFEST.txt is inside the zip
```
> A community signature is granted through the review; you sign with your
> `plugins:write` token once the plugin is registered/approved.

## Host the archive + hash

```bash
# upload to any public URL (we use DO Spaces)
aws s3 cp devopstech-kubemeridian-app.zip \
  s3://sc-platform-static/kubemeridian/devopstech-kubemeridian-app.zip \
  --endpoint-url https://fra1.digitaloceanspaces.com --acl public-read

# the form needs the SHA1 of the hosted zip
sha1sum devopstech-kubemeridian-app.zip
```

## Submit

**Grafana Cloud → Org settings → My Plugins → Submit Plugin**, fill:

| Field | Value |
|---|---|
| OS & Architecture | Multiple (frontend-only) |
| Plugin URL | the public ZIP URL above |
| Source code URL | `https://github.com/blackcheshire13/kubemeridian` |
| SHA1 | from `sha1sum` |
| Testing guidance | see below |

**Testing guidance to paste:**
> Frontend-only Kubernetes observability app + a bundled datasource that proxies
> read-only GET requests to the Kubernetes API (token injected server-side via
> `secureJsonData`, `__proxy` route). To test: add a cluster (Apps → KubeMeridian
> → Clusters → Add cluster) pointing at a Kubernetes API URL with a read-only
> ServiceAccount token; link a Prometheus datasource for dashboards (Loki/Tempo
> optional). Deploy manifests for an in-cluster Grafana are in `deploy/`.

## Review notes (expect questions about)

- The **`__proxy` route to the Kubernetes API** — reviewers check for SSRF /
  arbitrary-host proxying. Our route targets only the configured `cluster_url`
  with TLS handling and `secureJsonData` token injection; it is read-only (GET).
- The **bundled datasource** — declared in the app `plugin.json` `includes`
  (`path: datasource/plugin.json`).
- **No backend, no telemetry.** Apache-2.0.

The current build is **validator-clean (0 errors)**; remaining warnings are the
expected "unsigned/new plugin" (resolved on approval) and a React-19 forward-compat
false positive on Grafana 13.
