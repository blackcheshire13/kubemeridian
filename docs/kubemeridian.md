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
      link: /guide/install
    - theme: alt
      text: Read the guide
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/blackcheshire13/kubemeridian

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
---

## Why KubeMeridian

Most Kubernetes monitoring setups are a pile of imported dashboards that drift, half-wired datasources, and a RED dashboard that only works for one ingress. **KubeMeridian** is the opposite: a single Grafana app where you point at your existing observability backends and immediately get a coherent, drill-downable view of every cluster.

- **Frontend-only & open source.** No agent, no backend binary, Apache-2.0. It reads your Kubernetes API (read-only) and queries the datasources you already run.
- **Stack-agnostic.** Metrics from any Prometheus-compatible store; logs from Loki; traces from Tempo; RED from whichever mesh/ingress you run (or a custom mapping).
- **Batteries included.** 12+ bundled dashboards and a curated Prometheus alert pack ship with the plugin.

> [!TIP]
> New here? Start with [Install](/guide/install), then [Connect your stack](/guide/connections) — that's the whole setup.
