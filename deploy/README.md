# Deploying KubeGraf to the in-cluster Grafana

Target: the kube-prometheus-stack release `kps` Grafana on
`do-fra1-starcrown-internal`, namespace `monitoring`, Grafana 13.x
(https://mon.starcrown.team). The plugin is **unsigned**.

This is the procedure that was actually used to deploy (verified end-to-end:
the datasource proxies to the live API and returns nodes/namespaces).

## 1. Build & publish the plugin zip

```bash
npm ci && npm run build
bash scripts/package.sh          # -> starcrown-kubegraf-app.zip
aws s3 cp starcrown-kubegraf-app.zip \
  s3://sc-platform-static/kubegraf/starcrown-kubegraf-app.zip \
  --endpoint-url https://fra1.digitaloceanspaces.com --acl public-read
```

URL referenced by the overlay:
`https://sc-platform-static.fra1.digitaloceanspaces.com/kubegraf/starcrown-kubegraf-app.zip`

## 2. Read-only ServiceAccount + token

```bash
kubectl --context do-fra1-starcrown-internal apply -f deploy/rbac.yaml
```

## 3. Install the plugin into Grafana (Helm)

```bash
helm upgrade kps prometheus-community/kube-prometheus-stack \
  --version 86.2.3 -n monitoring --kube-context do-fra1-starcrown-internal \
  --reuse-values -f deploy/kps-grafana-overlay.yaml
```

The overlay (see `kps-grafana-overlay.yaml`) only touches `grafana.*`:

- **`GF_INSTALL_PLUGINS`** (url;folder) — Grafana's classic installer reliably
  installs the unsigned zip. The chart's `plugins:` list did **not** (it routes
  through Grafana preinstall, which didn't fetch the URL).
- **`deploymentStrategy: Recreate`** — the Grafana PVC is ReadWriteOnce; a
  RollingUpdate deadlocks on Multi-Attach. Recreate rolls cleanly (brief
  downtime of the monitoring Grafana).
- **`allow_loading_unsigned_plugins: starcrown-kubegraf-app,starcrown-kubegraf-datasource`**
  — both ids are required; in Grafana 13 the bundled datasource does **not**
  inherit the app's unsigned permission.

## 4. Provision the datasource (sidecar)

The Grafana datasources sidecar watches Secrets labelled `grafana_datasource=1`.
Inject the SA token (not committed) and apply:

```bash
TOKEN=$(kubectl --context do-fra1-starcrown-internal -n monitoring \
          get secret kubegraf-readonly-token -o jsonpath='{.data.token}' | base64 -d)
sed "s|__SA_TOKEN__|$TOKEN|" deploy/grafana-datasource.yaml | \
  kubectl --context do-fra1-starcrown-internal apply -f -
```

## 5. Enable the app

```bash
# admin password: kubectl -n monitoring get secret kps-grafana -o jsonpath='{.data.admin-password}' | base64 -d
curl -s -u admin:PASS -X POST -H 'Content-Type: application/json' \
  -d '{"enabled":true,"pinned":true}' \
  https://mon.starcrown.team/api/plugins/starcrown-kubegraf-app/settings
```

The enabled state persists in the Grafana DB (on the PVC), surviving restarts.

## Verify

```bash
# via the datasource proxy (admin):
curl -s -u admin:PASS \
  https://mon.starcrown.team/api/datasources/proxy/uid/<DS_UID>/__proxy/api/v1/nodes
```

In the UI: Apps → **KubeGraf** → Clusters → `KubeGraf — internal` → Applications /
Nodes overview.
