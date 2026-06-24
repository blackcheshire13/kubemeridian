# Services (RED & SLO)

The **Services** page shows the golden signals — **R**ate, **E**rrors,
**D**uration — plus an SLO error budget and multi-window burn rate, for any
service. It's a Grafana Scenes page whose queries are generated from your
cluster's **traffic profile**, so it adapts to whatever ingress/mesh you run.

## What you get

- **Request rate**, **Error %**, **Availability (SLI)** as stats.
- **Latency** p50 / p90 / p99 (percentiles where the stack exposes a histogram;
  an average fallback for stacks like HAProxy that don't).
- **Error budget remaining (30d)** against a configurable SLO target.
- **Burn rate (1h / 6h)** — fast-burn when both windows exceed 14.4×, the
  Google-SRE multi-window signal.

## Pick your stack

Set the **Traffic / RED source** in the cluster config — or click **Auto-detect**
to probe your Prometheus. Supported out of the box: **Istio, Linkerd,
Cilium/Hubble, ingress-nginx, Traefik, HAProxy, Envoy (Gateway API / Contour /
Emissary), Kong, Consul, Kuma**, plus generic **Prometheus-client HTTP** and
**OpenTelemetry HTTP** — or a fully **custom** metric/label mapping.

See [Traffic stack profiles](/guide/traffic-profiles) for the exact metrics each
profile uses and how to map a custom stack.
