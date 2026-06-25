# Changelog

## 2.4.1 — Review & catalog hardening

Pre-publication review pass — no feature changes, all fixes:

- **Lifecycle fix**: the Cluster Status page now cancels its component-refresh
  timer and guards async `setState` on unmount (no more `setState` on an
  unmounted component / leaked polling after navigating away).
- **Robustness**: optional chaining when matching pods to workloads in
  `BasePage` (a workload with no `spec.selector` no longer risks a throw); the
  panel toggle in Applications Overview uses a single clean state update.
- **Error boundary**: app pages are wrapped in an `ErrorBoundaryAlert`, so a
  render error shows an inline alert instead of a blank page.
- **Config clarity**: the custom traffic "Request metric" field documents that it
  also seeds the denominator/error metric.
- **Tests**: unit tests for traffic auto-detection and the Node model; e2e smoke
  tests that every app page mounts and renders.
- **Packaging**: the catalog README is now the real project README; the
  Services (RED) screenshot is included; the datasource links to docs; the
  package script emits a `{plugin-id}-{version}.zip` with its SHA1.
- **Dashboard QA** (verified live against a 29-node cluster): the Node
  dashboard's **SWAP Used** gauge no longer renders `NaN` on swapless nodes
  (`clamp_min` guards the 0/0 division → shows 0%). The Namespace Overview
  workload-count stats (Deployments / StatefulSets / DaemonSets / Jobs /
  CronJobs / Pods) now show **0** instead of "No data" for namespaces that have
  none of that workload type (`or vector(0)`). Applications Overview shows
  **"None"** instead of "No data" for empty workload columns.

## 2.4.0 — Multi-cloud Cost Explorer

A dedicated **Cost** page (Grafana app tab) that computes Kubernetes cost across
clouds, client-side, with a 4-tier pricing engine (best available wins):

- **Tier 0 — OpenCost**: uses `node_total_hourly_cost` etc. when present (most accurate).
- **Tier 1 — instance-type catalog**: bundled on-demand prices for AWS, GCP, Azure
  and DigitalOcean (auto-detected from the node `provider_id`; instance type from
  the `kube_node_labels` instance-type label), with optional regional multipliers.
- **Tier 2 — per-cloud flat** ($/vCPU + $/GiB) when the instance type isn't exposed.
- **Tier 3 — global flat** estimate (on-prem / unknown).

Views: estimated monthly + hourly, allocated vs **idle** (unrequested capacity),
breakdown by namespace (top spenders, CPU/mem efficiency), by node (cloud, type,
tier, $/hr·$/mo) and by cloud. The active pricing tier is shown per node so the
numbers stay honest. Pure pricing engine is unit-tested.

## 2.3.0 — Rebrand: KubeMeridian

Renamed the plugin from the revived "KubeGraf" to its own brand, **KubeMeridian**,
ahead of a Grafana catalog submission.

- Plugin ids: `starcrown-kubegraf-app` → `devopstech-kubemeridian-app`,
  `starcrown-kubegraf-datasource` → `devopstech-kubemeridian-datasource`.
- New logo (Hex Meridian in Kubernetes blue), display name, author (devopstech),
  dashboard titles/UIDs (`kubemeridian-*`), alert group names and deploy artifacts.
- No functional change — same features as 2.2.0.

> Note: the plugin id change is a new plugin identity. A fresh install/provision
> is required; the old `starcrown-kubegraf-*` install is superseded.

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

KubeMeridian evolves from a Kubernetes topology browser into a turnkey observability app:
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
- **Alert pack** (`deploy/kubemeridian-prometheusrule.yaml`) — 25 curated Prometheus alerts.
- Datasource gains events / PVC / PV / storageclass / ingress / resourcequota / HPA
  reads; RBAC extended accordingly.

### Changed
- The single `prometheus_name` (datasource NAME) link is superseded by `metrics_uid`
  (datasource UID, stable across renames). Existing datasources keep working — the
  legacy `prometheus_name` is migrated to a UID transparently on read.

## 1.0.x — Revival

Revived the abandoned DevOpsProdigy KubeMeridian plugin for modern Grafana (>= 12.3):
React 18 + `@grafana/create-plugin`, an app plugin (`devopstech-kubemeridian-app`) bundling
a Kubernetes API proxy datasource (`devopstech-kubemeridian-datasource`).

- Cluster Status (topology), Applications Overview (namespace → workload → pod) and
  Nodes Overview pages; multi-cluster management via the Clusters page.
- Five bundled Prometheus dashboards: Node, Pod resources, Deployment, StatefulSet,
  DaemonSet.
