# Changelog

## 2.0.1

- **RED & SLO dashboard now uses Istio service-mesh telemetry**
  (`istio_requests_total` / `istio_request_duration_milliseconds_bucket`,
  reporter=destination) instead of assuming app-level `http_*` metrics — it
  populates for every meshed workload with no instrumentation. Variables are now
  namespace + workload. Fixes the note that interpolated `$job` to empty.
- **Networking dashboard** gains an Istio mesh-traffic section (request rate,
  5xx ratio, p99 latency, top workloads) alongside the ingress-nginx section.

## 2.0.0 — Observability product

KubeGraf evolves from a Kubernetes topology browser into a turnkey observability app:
install one plugin, link your connections (metrics, logs, traces, cost), and get a
curated base monitoring stack.

### Added
- **Connections model**: each cluster datasource links a metrics (Prometheus), logs
  (Loki) and traces (Tempo) datasource by UID, plus FinOps cost settings (OpenCost
  toggle or an estimation price list). Configurable from the cluster ConfigEditor and
  the one-step "Add cluster" modal.
- **Three pillars** inside the plugin (built with `@grafana/scenes`): a **Logs** page +
  an **inline pod log drawer** (click a pod → Loki logs), and a **Traces** page (Tempo
  TraceQL search + service graph).
- **Events** page — live, filterable Kubernetes events feed.
- **9 new bundled dashboards**: Cluster Overview, Namespace Overview, Workload Health,
  Storage, Cost & Efficiency, Control Plane, Networking, RED & SLO (plus the existing
  Node/Pod/Deployment/StatefulSet/DaemonSet).
- **Alert pack** (`deploy/kubegraf-prometheusrule.yaml`) — 25 curated Prometheus alerts.
- Datasource gains events / PVC / PV / storageclass / ingress / resourcequota / HPA
  reads; RBAC extended accordingly.

### Changed
- The single `prometheus_name` (datasource NAME) link is superseded by `metrics_uid`
  (datasource UID, stable across renames). Existing datasources keep working — the
  legacy `prometheus_name` is migrated to a UID transparently on read.

## 1.0.x — Revival

Revived the abandoned DevOpsProdigy KubeGraf plugin for modern Grafana (>= 12.3):
React 18 + `@grafana/create-plugin`, an app plugin (`starcrown-kubegraf-app`) bundling
a Kubernetes API proxy datasource (`starcrown-kubegraf-datasource`).

- Cluster Status (topology), Applications Overview (namespace → workload → pod) and
  Nodes Overview pages; multi-cluster management via the Clusters page.
- Five bundled Prometheus dashboards: Node, Pod resources, Deployment, StatefulSet,
  DaemonSet.
