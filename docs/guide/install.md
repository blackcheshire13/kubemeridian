# Install

KubeMeridian is a standard Grafana app plugin. Until it lands in the Grafana
catalog you install it as an unsigned plugin from a release archive.

## Requirements

- Grafana **≥ 12.3** (built and tested on 13.x).
- A Prometheus-compatible datasource (kube-state-metrics + node-exporter + cAdvisor,
  e.g. kube-prometheus-stack) for the dashboards.
- Optional: Loki (logs), Tempo (traces), OpenCost (real cost).

## Option A — Grafana catalog

Once published, install it from **Administration → Plugins** like any other app.
*(Submission in progress.)*

## Option B — unsigned, from a release archive

```bash
# 1. allow the unsigned plugin (both ids — the bundled datasource needs it too)
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=devopstech-kubemeridian-app,devopstech-kubemeridian-datasource

# 2. install from a hosted zip (Grafana's classic installer)
GF_INSTALL_PLUGINS=https://<your-host>/devopstech-kubemeridian-app.zip;devopstech-kubemeridian-app
```

Set both as environment variables on the Grafana instance, then restart Grafana.
For an in-cluster (kube-prometheus-stack) Grafana, see [Deploy in-cluster](/guide/deploy)
— it covers the Helm overlay, the read-only RBAC and datasource provisioning.

> [!WARNING]
> A Grafana restart is required whenever the plugin is installed or updated
> (`plugin.json` changes are read at startup).

## Build it yourself

```bash
git clone https://github.com/blackcheshire13/kubemeridian
cd kubemeridian
npm ci
npm run build        # -> dist/
npm run server       # docker compose: Grafana with the plugin mounted (unsigned allowed)
```

Next: [Connect your stack](/guide/connections).
