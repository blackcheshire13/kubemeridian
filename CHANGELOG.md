# Changelog

## 2.2.0 — Fleet overview & onboarding

- The Clusters page is now a **fleet overview**: each cluster card shows live
  health (nodes ready / pods / namespaces, from the k8s API) and a **connection
  checklist** — chips for K8s API / Metrics / Logs / Traces / RED profile, so you
  see at a glance what's configured and what's missing, with edit deep-links.
- A **Services (RED)** shortcut on each cluster card.
- An onboarding hint when no Prometheus datasource exists yet.

## 2.1.0 — Configurable traffic stacks (RED for everyone)

RED/SLO no longer assumes one stack. A **traffic-profile registry** ships mappings
for the common ingress controllers and service meshes, and each cluster picks its
stack (or defines a custom mapping) — the plugin builds the RED queries to match.

### Added
- **Traffic profiles** (`src/traffic/profiles.ts`) for **Istio, Linkerd,
  Cilium/Hubble, ingress-nginx, Traefik, HAProxy, Envoy (Gateway API/Contour/
  Emissary), Kong, Consul, Kuma, Prometheus-client HTTP and OpenTelemetry HTTP**.
  Each encodes the rate/error/latency metrics + labels, the status-label form
  (numeric `5..` / digit `5` / class `5xx`), latency unit (s vs ms), histogram
  availability (HAProxy has none → avg fallback), the side filter (reporter/
  direction) and an enablement hint.
- **Per-cluster "Traffic / RED source"** in the ConfigEditor: pick a profile,
  **auto-detect** it from the linked Prometheus, or define a **Custom** mapping.
- **Services (RED) page** — a Grafana Scenes page that builds request rate,
  error %, SLI, latency percentiles, 30-day error budget and multi-window burn
  rate from the selected profile. Adapts variables to whether the stack exposes a
  namespace label.

### Changed / removed
- The static Istio-only `red-slo.json` dashboard is replaced by the
  profile-driven Services page (removed from the bundle).

## 2.0.2 — Audit fixes

Bug fixes from a full dashboard-vs-live-Prometheus + code audit:

- **statefulset dashboard**: CPU request/limit reference lines used the wrong
  label `container_name` on `kube_pod_container_resource_*` (KSM exposes
  `container`) — they were permanently empty. Fixed.
- **node dashboard**: the kube-state "Node CPU/Memory/Pods" panels filtered by
  `node=~"$node"` (a node-exporter `instance` IP) instead of `node=~"$nodeName"`
  (the node name) — permanently empty. Fixed all 8 targets.
- **logs scene**: free-text search is now backtick-delimited LogQL (a search with
  quotes/backslashes no longer breaks the query); the `pod` variable is `isMulti`
  so "All" interpolates correctly.
- **lifecycle**: Events/Logs/Traces pages guard against setState-after-unmount and
  the Events refresh timer leak.
- **Add cluster modal**: guards a missing `datasource.uid` and always clears the
  busy state.
- **topology**: workloads with `matchExpressions`-only selectors no longer attach
  every pod in the namespace; Jobs with an empty `ownerReferences` no longer
  disappear; Pending pods without `status` no longer risk a throw.

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
