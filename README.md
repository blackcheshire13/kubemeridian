# KubeGraf — Kubernetes monitoring app for modern Grafana

A revival of the abandoned [DevOpsProdigy KubeGraf](https://github.com/devopsprodigy/kubegraf)
Grafana app plugin, modernized to run on **Grafana 13.x**.

The original v1 was an AngularJS app plugin (dead since Grafana 11 removed AngularJS). The
unfinished [kubegraf-v2](https://github.com/devopsprodigy/kubegraf-v2) React rewrite targeted
Grafana 8 on the long-removed `@grafana/toolkit`. This repo rebuilds it on the current
`@grafana/create-plugin` toolchain (`@grafana/*` 13.x, React 18, webpack) and ports the source
forward.

## What it provides

- **App plugin** (`starcrown-kubegraf-app`) with cluster pages: Clusters list, Applications
  Overview (namespaces → workloads → pods map + cluster components), Nodes Overview.
- **Bundled datasource** (`starcrown-kubegraf-datasource`) — a thin proxy to the Kubernetes API
  server. Frontend-only: it proxies `GET` calls (nodes, pods, namespaces, deployments,
  statefulsets, daemonsets, jobs, cronjobs, services, component statuses) through Grafana with an
  optional ServiceAccount **bearer token** injected server-side.
- **5 bundled Prometheus dashboards**: Node, Pod resources, Deployment, StatefulSet, DaemonSet.

## Status

| Area | State |
|------|-------|
| Build on `@grafana/create-plugin` (Grafana 13.0.2) | ✅ `npm run build` clean |
| Loads unsigned in Grafana 13 (app + datasource registered) | ✅ verified |
| Datasource ported to current SDK (`lastValueFrom`, `getAppEvents`, batch/v1) | ✅ |
| Modern config editor (URL / bearer token / TLS skip-verify / Prometheus / refresh) | ✅ |
| Page UI modernization (path-based routing, `@grafana/ui` icons, theming) | 🚧 in progress |
| Deploy to in-cluster Grafana via GitOps + RBAC ServiceAccount | 🚧 planned |

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

## Origin

Based on `devopsprodigy/kubegraf-v2` (Apache-2.0). See [LICENSE](./LICENSE).
