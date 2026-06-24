# Connect your stack

A **cluster** in KubeMeridian is one datasource instance. Adding one is the whole
setup: point it at the Kubernetes API and link the observability backends you run.

## Add a cluster

**Apps → KubeMeridian → Clusters → Add cluster**, then fill the one-step form:

- **Kubernetes API server URL** — e.g. `https://kubernetes.default.svc` for an
  in-cluster Grafana.
- **ServiceAccount bearer token** — a **read-only** token (see [Deploy](/guide/deploy)
  for the RBAC). Stored encrypted in `secureJsonData`; injected server-side.
- **Skip TLS verify** — on for the in-cluster API certificate.
- **Metrics / Logs / Traces** — pick your Prometheus, Loki and Tempo datasources.

You can also set these later in the cluster's config (**Edit**).

## Connections

Each cluster links its datasources **by UID** (stable across renames):

| Connection | Powers | Required? |
|---|---|---|
| **Metrics** (Prometheus) | all dashboards, cost, RED | for dashboards |
| **Logs** (Loki) | the Logs page + inline pod logs | optional |
| **Traces** (Tempo) | the Traces page + service graph | optional |

The **Clusters** page shows a per-cluster checklist — green chips for what's wired,
muted for what's missing — plus live health (nodes ready / pods / namespaces).

## Cost & traffic

In the cluster config you also choose:

- **Cost (FinOps)** — toggle *OpenCost present* to use real hourly cost metrics, or
  leave it off to **estimate** from requests using a configurable price list
  (`$/vCPU-hour`, `$/GiB-hour`). See [Cost & efficiency](/guide/cost).
- **Traffic / RED source** — the ingress/mesh stack that exposes your request
  metrics (Istio, NGINX, Traefik, …) or **Auto-detect** it. See
  [Traffic stack profiles](/guide/traffic-profiles).

> [!TIP]
> Legacy installs that used the old single "Prometheus instance" field keep
> working — it's migrated to the metrics link automatically on read.

Next: [Topology & nodes](/guide/topology).
