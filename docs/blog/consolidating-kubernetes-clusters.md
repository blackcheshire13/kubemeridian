---
title: "From 10+ Kubernetes clusters to 4: a hub-and-spoke ArgoCD story"
description: How we consolidated 10+ Kubernetes clusters across four clouds into four, under one hub-and-spoke ArgoCD control plane — topology, GitOps layout and the gotchas.
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/consolidating-kubernetes-clusters
---

# From 10+ Kubernetes clusters to 4: a hub-and-spoke ArgoCD story

*2026-06-27 · kubernetes · argocd · gitops · platform-engineering*

We ran more than ten Kubernetes clusters across four clouds. Deploys were
inconsistent, on-call was painful, and there was no single place to see what ran
where. We consolidated into **four clusters under one hub-and-spoke ArgoCD control
plane**. This is the reasoning, the topology, and the gotchas worth knowing before
you try it.

## The problem

- **10+ clusters across 4 clouds** (DigitalOcean, AWS, GKE, Hetzner), each with its
  own deploy story.
- **No unified GitOps** — some Helm-by-hand, some CI-push, some clickops.
- **Per-cluster observability** — no federated view, slow incident triage.

The cost wasn't compute, it was cognitive load: every cluster was a slightly
different snowflake, and nobody could hold all ten in their head.

## The target: hub-and-spoke

One **hub cluster** runs the control plane; **spoke (workload) clusters** run only
workloads plus thin agents and register to the hub. Everything between hub and
spokes travels over **mTLS**.

```
            ┌────────────── hub ──────────────┐
            │ ArgoCD · Prometheus(fed) · Loki  │
            │ Tempo · Alertmanager · Vault     │
            └───┬───────────┬───────────┬──────┘
            mTLS│       mTLS │      mTLS │
          ┌─────▼───┐  ┌─────▼───┐ ┌─────▼───┐
          │ spoke A │  │ spoke B │ │ spoke C │
          └─────────┘  └─────────┘ └─────────┘
```

The hub holds: ArgoCD, a central Prometheus (federating from spokes), Loki, Tempo,
Alertmanager, Vault, and a policy/scanning layer (Trivy Operator). Spokes stay
deliberately boring.

## How GitOps is structured

- **App-of-apps.** One root `Application` points at a repo of `Application`s, so the
  entire fleet is described in Git and bootstraps itself.
- **ArgoCD Projects** per environment/team — RBAC and guardrails (which repos, which
  destinations, which namespaces) live here, not in tribal knowledge.
- **Sync waves** order the dependency chain: CRDs → operators → workloads. This single
  change removes most "resource type not found" flakes on a fresh cluster.
- **Secrets via Vault** (agent injector / external-secrets). Nothing sensitive in Git,
  ever.

## Gotchas we hit

1. **Cross-cloud reachability.** Hub↔spoke registration assumes a network path. Plan
   egress, peering and firewall rules *before* you register clusters, not after ArgoCD
   reports `Unknown`.
2. **CRD ordering.** Operators must exist before their custom resources. Sync waves fix
   this; without them, first-apply on a clean cluster is a coin toss.
3. **Federated metrics cardinality.** Federating *everything* centrally will melt your
   hub Prometheus. Federate selected aggregates, keep raw series local.
4. **One hub = one blast radius.** A single control plane is the whole point — and the
   whole risk. HA the hub across zones and back up ArgoCD + Vault as if production
   depends on them, because it does.

## Results

- **One pane of glass** to see and deploy everything; consistent, repeatable rollouts.
- **Lower operational overhead** and faster triage with federated logs and metrics.
- **Clear separation** of control plane vs workloads — spokes became replaceable.

This federated view is exactly the kind of thing [KubeMeridian](/) is built to
surface — cluster topology and health across a fleet, from one Grafana app.

## What I'd do differently

- Introduce **policy-as-code** (Kyverno/OPA) from day one, not after the third "how did
  that get deployed".
- Treat the hub's **disaster recovery** as a first-class, rehearsed runbook before
  go-live — not a wiki page written after the first scare.

---

*Written by the engineer behind [KubeMeridian](/) · [About](/about) ·
[GitHub](https://github.com/blackcheshire13)*
