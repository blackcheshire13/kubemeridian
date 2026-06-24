# Dashboards

KubeMeridian bundles curated Prometheus dashboards. They're computed **inline**
from raw kube-state-metrics, node-exporter and cAdvisor — they do **not** depend
on the kubernetes-mixin recording rules, so they work on a vanilla
kube-prometheus-stack. Every panel binds to the cluster's linked metrics
datasource via a `$PromDs` variable.

| Dashboard | What it shows |
|---|---|
| **Cluster Overview** | Capacity vs allocatable vs requests vs usage (CPU/mem), node readiness, pod phases, top namespaces, network/disk |
| **Namespace Overview** | Per-namespace usage, quotas, pods-by-phase, top workloads, restarts |
| **Workload Health** | CrashLoopBackOff, OOMKilled, ImagePull errors, pending / not-ready pods, restart rates, near-limit & throttling hotspots |
| **Storage** | PVC/inodes usage, used-vs-capacity, fill forecast (`predict_linear`), PV phases |
| **Cost & Efficiency** | Estimated/real cost, waste, right-sizing — see [Cost](/guide/cost) |
| **Control Plane** | apiserver rate/errors/latency, etcd, scheduler, controller-manager *(empty on managed clusters that hide these)* |
| **Networking** | Pod/node network + Istio mesh traffic + ingress-controller metrics |
| **Node / Pod / Deployment / StatefulSet / DaemonSet** | The classic per-object resource dashboards |

## Graceful degradation

Panels whose metrics aren't present in your environment render as **No data**
rather than erroring — e.g. control-plane panels on EKS/GKE/AKS/DOKS, or the
ingress-nginx section when you run a different controller. Each such dashboard
carries a short note explaining the dependency.

## Robustness

- `$__rate_interval` everywhere, so rates stay correct across scrape intervals and zoom.
- A `$cluster` selector (`=~`, default *All*) that also matches series **without**
  a `cluster` label — so single-cluster Prometheus setups just work.
