---
layout: home
pageClass: km-page
title: KubeMeridian
description: Archived — Kubernetes observability for Grafana in one Apache-2.0 app plugin. Not in the Grafana catalog; v2.5.2 remains available as an unsigned plugin.

hero:
  name: KubeMeridian
  text: Kubernetes observability for Grafana
  tagline: One app plugin for the whole base monitoring stack — metrics, logs, traces, cost and SLOs.
  actions:
    - theme: brand
      text: Install v2.5.2 (unsigned)
      link: '#install'
    - theme: alt
      text: Guide and source at v2.5.2
      link: https://github.com/blackcheshire13/kubemeridian/tree/v2.5.2

features:
  - title: One plugin, the whole stack
    details: A Grafana app that wires your Prometheus, Loki, Tempo and cost data into curated Kubernetes views — no dashboard-hunting, no glue.
  - title: Live topology
    details: Cluster status, namespace → workload → pod maps and node health, straight from the Kubernetes API via a read-only token.
  - title: Curated dashboards
    details: Cluster overview, namespace, workload health, storage, control-plane and networking — computed inline from kube-state-metrics, node-exporter and cAdvisor.
  - title: Logs & traces inline
    details: Click a pod to read its Loki logs in a drawer; explore Tempo traces and the service graph — built on Grafana Scenes.
  - title: Cost & right-sizing
    details: Estimate cost from requests (or OpenCost), surface waste, and find over- and under-provisioned workloads.
  - title: RED & SLOs for any stack
    details: Rate / errors / latency / error-budget burn rate from Istio, Linkerd, Cilium, NGINX, Traefik, Envoy, Kong and more — pick or auto-detect your stack.
seoTitle: "KubeMeridian: Kubernetes observability for Grafana"
updated: 2026-11-06
---

## Why KubeMeridian

Most Kubernetes monitoring setups are a pile of imported dashboards that drift, half-wired datasources, and a RED dashboard that only works for one ingress. **KubeMeridian** is the opposite: a single Grafana app where you point at your existing observability backends and immediately get a coherent, drill-downable view of every cluster.

- **Frontend-only & open source.** No agent, no backend binary, Apache-2.0. It reads your Kubernetes API (read-only) and queries the datasources you already run.
- **Stack-agnostic.** Metrics from any Prometheus-compatible store; logs from Loki; traces from Tempo; RED from whichever mesh/ingress you run (or a custom mapping).
- **Batteries included.** 12+ bundled dashboards and a curated Prometheus alert pack ship with the plugin.

## Install

KubeMeridian is archived and not in the Grafana catalog, so it installs as an unsigned plugin
from the last release, [v2.5.2](https://github.com/blackcheshire13/kubemeridian/releases/tag/v2.5.2).
It needs Grafana 12.3 or newer and a Prometheus-compatible datasource; Loki, Tempo and OpenCost
are optional. Set both variables on the Grafana instance and restart it:

```bash
# allow the unsigned plugin (both ids: the bundled datasource needs it too)
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=devopstech-kubemeridian-app,devopstech-kubemeridian-datasource

# install the v2.5.2 release archive
GF_INSTALL_PLUGINS='https://github.com/blackcheshire13/kubemeridian/releases/download/v2.5.2/devopstech-kubemeridian-app-2.5.2.zip;devopstech-kubemeridian-app'
```

The full user guide (connecting datasources, in-cluster deployment with RBAC, the alert pack,
traffic profiles) and the plugin source are kept at the
[v2.5.2 tag](https://github.com/blackcheshire13/kubemeridian/tree/v2.5.2/docs/guide); this
repository's main branch now holds only the devopstech.net site.
