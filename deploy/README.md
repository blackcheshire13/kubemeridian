# Deploying KubeGraf to an in-cluster Grafana

Target: the kube-prometheus-stack Grafana (`kps`) on `do-fra1-starcrown-internal`,
namespace `monitoring`, Grafana 13.x.

The plugin is **unsigned**, so Grafana must be told to permit it. The bundled
datasource inherits the app's unsigned permission — only the app id needs allowing.

## 1. Build & package the plugin zip

```bash
npm ci
npm run build
mv dist starcrown-kubegraf-app
zip -r starcrown-kubegraf-app.zip starcrown-kubegraf-app
```

Publish `starcrown-kubegraf-app.zip` where the Grafana pod can reach it:

- a GitHub release asset on `blackcheshire13/kubegraf` (private repo → use a public
  release or a pre-signed URL), or
- a DO Spaces object (e.g. `cdn-frontend`) with a public URL.

Put that URL into `kps-grafana-values.yaml` (`grafana.plugins`).

## 2. Create the read-only ServiceAccount + token

```bash
kubectl --context do-fra1-starcrown-internal apply -f rbac.yaml
```

This creates `kubegraf-readonly` (SA + ClusterRole + binding) and a long-lived
token Secret `kubegraf-readonly-token` in `monitoring`.

## 3. Wire the Helm values

Merge `kps-grafana-values.yaml` into the kube-prometheus-stack values in the GitOps
repo and let Argo CD sync (per infra-iac-first / GitOps). It:

- installs the plugin from the zip URL and allows it as unsigned,
- mounts the SA token into the Grafana pod,
- provisions a `KubeGraf — internal` datasource at `https://kubernetes.default.svc`
  using `$__file{}` to read the token (no secret in values).

`plugin.json`/datasource changes require a Grafana restart — rolling the
deployment (or an Argo CD sync that rolls the pod) is enough.

## 4. Verify

- Apps → **KubeGraf** appears; **Clusters** lists the provisioned `KubeGraf — internal`.
- Open a cluster → Applications / Nodes overview renders live namespaces/pods.
- The 5 bundled dashboards (Node / Pod resources / Deployment / StatefulSet /
  DaemonSet) import against your Prometheus.

## Multi-cluster

Add one provisioned datasource per cluster (each becomes a "cluster" on the
Clusters page). For remote clusters, set `cluster_url` to the API server and supply
a read-only token from that cluster.
