# Alert pack

KubeMeridian ships a curated **Prometheus Operator `PrometheusRule`** with 25
alerts across the common Kubernetes failure modes, evaluated by your own
Prometheus / Alertmanager.

## Install

```bash
kubectl apply -f deploy/kubemeridian-prometheusrule.yaml
```

Set the `release:` label to match your Prometheus Operator `ruleSelector`
(kube-prometheus-stack uses the Helm release name).

## Groups

| Group | Alerts |
|---|---|
| **nodes** | NotReady, Memory/Disk/PID pressure, filesystem almost full |
| **workloads** | CrashLooping, **OOMKilled**, **high restart rate**, container waiting, **Pending**, **Failed**, Deployment/StatefulSet mismatch, DaemonSet rollout, Job failed, HPA maxed |
| **resources** | CPU throttling, quota almost full |
| **storage** | PV/PVC & inodes filling up (crit + warn), PV errors |
| **monitoring-meta** | **KubeStateMetricsDown** (highest-value), NodeExporterDown, TargetDown |

> [!TIP]
> kube-prometheus-stack already ships most of the canonical kubernetes-mixin
> alerts. If you run it with defaults, install only the **bold** "KubeMeridian
> addition" rules to avoid duplicates. For a raw Prometheus + KSM setup, apply the
> whole file. Full guidance is in the file header.
