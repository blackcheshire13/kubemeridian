# Deploying KubeMeridian to an in-cluster Grafana

These are example manifests for installing KubeMeridian into a Grafana running
inside your Kubernetes cluster (here: a kube-prometheus-stack release named
`kps` in the `monitoring` namespace, Grafana 13.x). Replace the placeholders
(`<your-kube-context>`, `https://grafana.example.com`, the object-storage URL)
with your own values. Until the plugin is signed by Grafana it is **unsigned**,
so it must be allow-listed (see step 3).

## 1. Build & publish the plugin zip

```bash
npm ci && npm run build
bash scripts/package.sh          # -> devopstech-kubemeridian-app-<version>.zip
```

Host the zip on any object storage / web server your cluster can reach over
HTTPS (or use the GitHub Release asset produced by the release workflow), and
note the public URL — the Helm overlay references it via `GF_INSTALL_PLUGINS`.

## 2. Read-only ServiceAccount + token

```bash
kubectl --context <your-kube-context> apply -f deploy/rbac.yaml
```

## 3. Install the plugin into Grafana (Helm)

```bash
helm upgrade kps prometheus-community/kube-prometheus-stack \
  --version 86.2.3 -n monitoring --kube-context <your-kube-context> \
  --reuse-values -f deploy/kps-grafana-overlay.yaml
```

The overlay (see `kps-grafana-overlay.yaml`) only touches `grafana.*`:

- **`GF_INSTALL_PLUGINS`** (url;folder) — Grafana's classic installer reliably
  installs the unsigned zip. The chart's `plugins:` list did **not** (it routes
  through Grafana preinstall, which didn't fetch the URL).
- **`deploymentStrategy: Recreate`** — the Grafana PVC is ReadWriteOnce; a
  RollingUpdate deadlocks on Multi-Attach. Recreate rolls cleanly (brief
  downtime of the monitoring Grafana).
- **`allow_loading_unsigned_plugins: devopstech-kubemeridian-app,devopstech-kubemeridian-datasource`**
  — both ids are required; in Grafana 13 the bundled datasource does **not**
  inherit the app's unsigned permission. (Drop this once the plugin is signed.)

## 4. Provision the datasource (sidecar)

The Grafana datasources sidecar watches Secrets labelled `grafana_datasource=1`.
Inject the SA token (not committed) and apply:

```bash
TOKEN=$(kubectl --context <your-kube-context> -n monitoring \
          get secret kubemeridian-readonly-token -o jsonpath='{.data.token}' | base64 -d)
sed "s|__SA_TOKEN__|$TOKEN|" deploy/grafana-datasource.yaml | \
  kubectl --context <your-kube-context> apply -f -
```

## 5. Enable the app

```bash
# admin password: kubectl -n monitoring get secret kps-grafana -o jsonpath='{.data.admin-password}' | base64 -d
curl -s -u admin:PASS -X POST -H 'Content-Type: application/json' \
  -d '{"enabled":true,"pinned":true}' \
  https://grafana.example.com/api/plugins/devopstech-kubemeridian-app/settings
```

The enabled state persists in the Grafana DB (on the PVC), surviving restarts.

## Verify

```bash
# via the datasource proxy (admin):
curl -s -u admin:PASS \
  https://grafana.example.com/api/datasources/proxy/uid/<DS_UID>/__proxy/api/v1/nodes
```

In the UI: Apps → **KubeMeridian** → Clusters → your cluster → Applications /
Nodes overview.
