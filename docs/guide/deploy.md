# Deploy in-cluster

This is the recipe for an in-cluster Grafana (e.g. kube-prometheus-stack). The
repo's [`deploy/`](https://github.com/blackcheshire13/kubemeridian/tree/main/deploy)
folder has everything.

## 1. Read-only ServiceAccount + RBAC

```bash
kubectl apply -f deploy/rbac.yaml
```

Creates a `kubemeridian-readonly` ServiceAccount with a ClusterRole granting
`get/list/watch` on the resources the app reads (nodes, pods, namespaces,
services, workloads, events, PVC/PV, ingresses, resourcequotas, HPAs) — and a
long-lived token Secret.

## 2. Install the plugin (Helm overlay)

```bash
helm upgrade <kps-release> prometheus-community/kube-prometheus-stack \
  -n monitoring --reuse-values -f deploy/kps-grafana-overlay.yaml
```

The overlay only touches `grafana.*`:

- `GF_INSTALL_PLUGINS` — installs the unsigned zip from your host.
- `allow_loading_unsigned_plugins` — **both** ids (`devopstech-kubemeridian-app`,
  `devopstech-kubemeridian-datasource`); in Grafana 13 the bundled datasource does
  not inherit the app's permission.
- `deploymentStrategy: Recreate` — the Grafana PVC is RWO; RollingUpdate deadlocks
  on Multi-Attach.

## 3. Provision the datasource

The datasources sidecar watches Secrets labelled `grafana_datasource=1`. Inject
the SA token (not committed) and apply:

```bash
TOKEN=$(kubectl -n monitoring get secret kubemeridian-readonly-token \
          -o jsonpath='{.data.token}' | base64 -d)
sed "s|__SA_TOKEN__|$TOKEN|" deploy/grafana-datasource.yaml | kubectl apply -f -
```

Provisioned datasources are API-read-only — edit connections by changing this
Secret and re-applying, not via the UI.

## 4. Enable the app & install alerts

```bash
curl -s -u admin:PASS -X POST -H 'Content-Type: application/json' \
  -d '{"enabled":true,"pinned":true}' \
  https://<grafana>/api/plugins/devopstech-kubemeridian-app/settings

kubectl apply -f deploy/kubemeridian-prometheusrule.yaml   # optional alert pack
```

## Updating

`GF_INSTALL_PLUGINS` skips an already-installed plugin, so to roll a new build:
re-upload the zip, then `rm -rf /var/lib/grafana/plugins/devopstech-kubemeridian-app`
in the pod and `rollout restart` the Grafana deployment.
