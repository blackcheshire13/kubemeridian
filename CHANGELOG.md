# Changelog

## Unreleased — 2.0 (observability product)

KubeGraf is evolving from a Kubernetes topology browser into a turnkey observability
app: install one plugin, link your connections (metrics, logs, traces, cost), and get
a curated base monitoring stack.

### Added
- **Connections model**: each cluster datasource now links a metrics (Prometheus),
  logs (Loki) and traces (Tempo) datasource by UID, plus FinOps cost settings
  (OpenCost toggle or an estimation price list). Configurable from both the cluster
  ConfigEditor and the one-step "Add cluster" modal.

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
