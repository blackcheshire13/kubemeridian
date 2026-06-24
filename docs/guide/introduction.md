# Introduction

**KubeMeridian** is a Grafana **app plugin** that turns Grafana into a turnkey
Kubernetes observability product. You install one plugin, link the observability
backends you already run, and get a coherent set of views across the four pillars:

| Pillar | Source | What you get |
|---|---|---|
| **Inventory / topology** | Kubernetes API (read-only) | Cluster status, namespace → workload → pod maps, node health, events |
| **Metrics** | Prometheus / Mimir / Thanos | Cluster, namespace, workload, storage, control-plane and networking dashboards |
| **Logs** | Loki | Inline pod logs (click a pod) and a logs explorer |
| **Traces** | Tempo | TraceQL search and the service graph |

On top of that it adds **cost & right-sizing**, **RED & SLOs** for any ingress/mesh
stack, and a curated **Prometheus alert pack**.

## How it's built

- **App plugin** (`devopstech-kubemeridian-app`) — the pages, dashboards and config.
- **Bundled datasource** (`devopstech-kubemeridian-datasource`) — a thin, frontend
  proxy to the Kubernetes API. It injects a read-only ServiceAccount bearer token
  **server-side** (the token never reaches the browser) and only ever issues `GET`
  requests.
- **No backend binary**, Apache-2.0, works on Grafana ≥ 12.3.

Each "cluster" you add is one datasource instance. A cluster links a metrics, logs
and traces datasource plus its cost and traffic settings — see
[Connect your stack](/guide/connections).

## What it is not

- It does **not** collect data — it reads the Kubernetes API and queries the
  datasources you already operate (kube-prometheus-stack, Loki, Tempo, …).
- It does **not** write to your cluster — everything is read-only.

Next: [Install](/guide/install).
