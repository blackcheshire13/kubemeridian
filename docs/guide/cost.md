# Cost & efficiency

The **Cost & Efficiency** dashboard gives you FinOps numbers from data you already
have — it works with kube-state-metrics alone, and gets more precise with OpenCost.

## Two modes

- **Estimated (default):** cluster- and namespace-level monthly cost computed from
  resource **requests** × a configurable price list (`$/vCPU-hour`, `$/GiB-hour`,
  set per cluster). Works everywhere.
- **OpenCost:** toggle *OpenCost present* in the cluster config to light up the
  real node-cost panel (`node_total_hourly_cost`). Empty if the exporter isn't
  installed.

## Right-sizing

- **Efficiency gauges** — usage as a share of requests (CPU & memory).
- **Waste** — requested minus used, by namespace.
- **Over-provisioned** — containers using < 50% of their CPU request.
- **No request set** — containers consuming CPU with no request (scheduling risk).
- **Limit : request ratio** — high ratios flag burst/eviction risk.

Use these to tighten requests/limits and cut spend without guesswork.
