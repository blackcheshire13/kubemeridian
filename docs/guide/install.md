# Install

KubeMeridian is a standard Grafana app plugin, distributed as an **unsigned**
plugin via [GitHub Releases](https://github.com/blackcheshire13/kubemeridian/releases)
— it is not listed in the Grafana plugin catalog.

## Requirements

- Grafana **≥ 12.3** (built and tested on 13.x).
- A Prometheus-compatible datasource (kube-state-metrics + node-exporter + cAdvisor,
  e.g. kube-prometheus-stack) for the dashboards.
- Optional: Loki (logs), Tempo (traces), OpenCost (real cost).

## Install from a GitHub Release

Every tagged version publishes a plugin zip as a
[GitHub Release](https://github.com/blackcheshire13/kubemeridian/releases) asset.

```bash
# 1. allow the unsigned plugin (both ids — the bundled datasource needs it too)
GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=devopstech-kubemeridian-app,devopstech-kubemeridian-datasource

# 2. install from the release zip (Grafana's classic installer)
GF_INSTALL_PLUGINS=https://github.com/blackcheshire13/kubemeridian/releases/download/v2.5.2/devopstech-kubemeridian-app-2.5.2.zip;devopstech-kubemeridian-app
```

Set both as environment variables on the Grafana instance (or the equivalents in
`grafana.ini`: `[plugins] allow_loading_unsigned_plugins` and `[plugins] preinstall_sync`),
then restart Grafana. Alternatively, unzip the release archive into the Grafana
plugins directory (`/var/lib/grafana/plugins`) and restart.
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
