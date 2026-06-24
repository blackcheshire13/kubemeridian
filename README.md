# KubeMeridian — Kubernetes observability app for Grafana

**KubeMeridian** turns Grafana into a turnkey Kubernetes observability product: install one
app plugin, link your connections (metrics, logs, traces, cost), and get a curated base
monitoring stack — topology, dashboards, logs, traces, cost/efficiency and an alert pack.

Built for **Grafana 13.x** on `@grafana/create-plugin` (`@grafana/*` 13.x, React 18,
`@grafana/scenes`, webpack). Frontend-only, open-source, self-hostable.

## What it provides

### App pages (per cluster)
- **Clusters** — add/manage clusters; each cluster is one datasource instance.
- **Cluster Status** — control-plane components + node grid with pod-status squares.
- **Applications Overview** — namespaces → workloads → pods map (deployments / statefulsets /
  daemonsets / jobs / cronjobs / other pods) with services. **Click a pod → inline Loki logs.**
- **Nodes Overview** — per-node status, roles, CPU/memory requests vs allocatable, pod count.
- **Events** — live, filterable Kubernetes events feed (type / namespace / text).
- **Logs** — Loki logs explorer (namespace/pod/container + free-text), built with Grafana Scenes.
- **Traces** — Tempo TraceQL search + service graph, built with Grafana Scenes.
- **Services (RED)** — request rate / errors / latency / SLO + error-budget burn rate,
  driven by your cluster's **traffic profile** (Istio / Linkerd / Cilium / nginx /
  Traefik / HAProxy / Envoy / Kong / Consul / Kuma / app-HTTP / OTel — or a custom
  metric mapping). Pick or auto-detect the stack in the cluster config.

### Bundled dashboards (Prometheus)
Curated, computed inline from raw kube-state-metrics / node-exporter / cAdvisor (no mixin
recording rules required):

- **Cluster Overview**, **Namespace Overview**, **Workload Health** (CrashLoop/OOM/Pending/
  throttling), **Storage** (PVC/PV), **Cost & Efficiency** (FinOps), **Control Plane**,
  **Networking**, **RED & SLO**, plus the classic **Node / Pod / Deployment / StatefulSet /
  DaemonSet** dashboards.

### Connections & cost
Each cluster links a **metrics (Prometheus)**, **logs (Loki)** and **traces (Tempo)** datasource
by UID, plus FinOps cost settings (OpenCost toggle or an estimation price list). Configure them
in the cluster ConfigEditor or the one-step *Add cluster* modal.

### Alert pack
`deploy/kubemeridian-prometheusrule.yaml` — 25 curated Prometheus Operator alerts (nodes, workloads,
resources, storage, monitoring-meta) for environments without the kube-prometheus-stack mixin.

### Datasource
`devopstech-kubemeridian-datasource` — a thin proxy to the Kubernetes API. Frontend-only: it proxies
read-only `GET` calls through Grafana with a ServiceAccount **bearer token** injected server-side
(`secureJsonData`, never exposed to the browser), and implements `metricFindQuery` for dashboard
template variables.

## Develop

```bash
npm install
npm run dev          # webpack watch build into ./dist
npm run server       # docker compose: Grafana 13.x with the plugin mounted (unsigned allowed)
# open http://localhost:3000  (admin / admin)
npm run typecheck
npm run build        # production build
```

The dev Grafana sets `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=devopstech-kubemeridian-app`.

## Deploy (in-cluster Grafana)

See [`deploy/`](./deploy): a read-only ServiceAccount + RBAC (`rbac.yaml`), a kube-prometheus-stack
Grafana overlay (`kps-grafana-overlay.yaml`), the datasource provisioning Secret
(`grafana-datasource.yaml`) and the alert pack (`kubemeridian-prometheusrule.yaml`).

## Configure a cluster

Create a `KubeMeridian Kubernetes` datasource (or use *Add cluster*) and set:

- **API server URL** — e.g. `https://kubernetes.default.svc` (when Grafana runs in-cluster).
- **Access via bearer token** — on; paste a read-only ServiceAccount token.
- **Skip TLS verify** — on for the in-cluster API server certificate.
- **Connections** — link your Prometheus / Loki / Tempo datasources.

## License

Distributed under Apache-2.0. See [LICENSE](./LICENSE).
