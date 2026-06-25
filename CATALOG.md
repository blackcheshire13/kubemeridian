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

## Build, sign, package & host — via GitHub Releases (recommended)

The release workflow (`.github/workflows/release.yml`) builds, **signs** and
attaches a `{plugin-id}-{version}.zip` to a GitHub Release when you push a tag.
One-time: add the repo secret **`GRAFANA_ACCESS_POLICY_TOKEN`** (Settings →
Secrets and variables → Actions) with your `plugins:write` token.

```bash
# bump version in package.json + CHANGELOG.md, then:
git tag v2.4.1 && git push origin v2.4.1
```

The Release asset URL is your **public ZIP URL**; the workflow also prints the
zip's checksum (use it as the SHA1 in the form). Grafana grants the community
signature on approval; signing with your token registers the build.

## Build, sign, package & host — manual fallback

```bash
npm ci && npm run build                       # -> dist/
bash scripts/package.sh                        # -> devopstech-kubemeridian-app-<version>.zip (+ prints SHA1)
npx @grafana/plugin-validator@latest devopstech-kubemeridian-app-*.zip   # sanity check

GRAFANA_ACCESS_POLICY_TOKEN=<token> npm run sign   # community signature
bash scripts/package.sh                            # re-package so MANIFEST.txt is inside
```

Host the zip on any public HTTPS URL (object storage / web server) and take its
`sha1sum` for the submission form.

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
