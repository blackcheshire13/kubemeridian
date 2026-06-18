# KubeGraf — Kubernetes monitoring app for modern Grafana

**KubeGraf** is a Grafana app plugin for monitoring Kubernetes clusters, built for
**Grafana 13.x** on the current `@grafana/create-plugin` toolchain (`@grafana/*` 13.x,
React 18, webpack).

## What it provides

- **App plugin** (`starcrown-kubegraf-app`) with cluster pages:
  - **Clusters** — manage cluster datasource instances.
  - **Applications Overview** — control-plane components + a namespaces → workloads → pods map
    (deployments / statefulsets / daemonsets / jobs / cronjobs / other pods) with services.
  - **Nodes Overview** — per-node status, roles, CPU/memory **requests vs allocatable** (summed
    from pods on the node), pod count, kubelet/OS/runtime info, and a Node-dashboard deep-link.
- **Bundled datasource** (`starcrown-kubegraf-datasource`) — a thin proxy to the Kubernetes API
  server. Frontend-only: it proxies `GET` calls (nodes, pods, namespaces, deployments,
  statefulsets, daemonsets, jobs, cronjobs, services, component statuses) through Grafana with an
  optional ServiceAccount **bearer token** injected server-side. Implements `metricFindQuery` so
  dashboard template variables (`$node`, `$nodeHost`, `$namespace`) resolve from the cluster.
- **5 bundled Prometheus dashboards**: Node, Pod resources, Deployment, StatefulSet, DaemonSet.

## Status

| Area | State |
|------|-------|
| Build on `@grafana/create-plugin` (Grafana 13.0.2) | ✅ clean (`build`, `typecheck`, `lint`, unit tests) |
| Loads unsigned in Grafana 13 (app + datasource registered) | ✅ verified |
| Datasource on current SDK (`lastValueFrom`, `getAppEvents`, batch/v1, `metricFindQuery`) | ✅ |
| Pages (path-based routing, `@grafana/ui` icons, theming, hardened models) | ✅ |
| Deployed to in-cluster Grafana via Helm + RBAC ServiceAccount (`deploy/`) | ✅ |

## Develop

```bash
npm install
npm run dev          # webpack watch build into ./dist
npm run server       # docker compose: Grafana 13.0.2 with the plugin mounted (unsigned allowed)
# open http://localhost:3000  (admin / admin)
npm run typecheck
npm run build        # production build
```

The dev Grafana sets `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=starcrown-kubegraf-app`; the
bundled datasource inherits the parent app's unsigned permission.

## Configure a cluster

Create a `KubeGraf Kubernetes` datasource and point it at the Kubernetes API:

- **API server URL** — e.g. `https://kubernetes.default.svc` (when Grafana runs in-cluster).
- **Access via bearer token** — on; paste a read-only ServiceAccount token.
- **Skip TLS verify** — on for the in-cluster API server certificate.

Each datasource instance is treated as one "cluster" on the Clusters page.

## License

Distributed under Apache-2.0. See [LICENSE](./LICENSE).
