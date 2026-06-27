---
title: Blog
description: Notes on Kubernetes, observability, platform engineering and security — from the engineer behind KubeMeridian.
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/
---

# Blog

Field notes on Kubernetes, observability, platform engineering and security — the
day-2 problems behind [KubeMeridian](/) and the fixes I ship for them.

---

## [From 10+ Kubernetes clusters to 4: a hub-and-spoke ArgoCD story](/blog/consolidating-kubernetes-clusters)
<small>2026-06-27 · kubernetes, argocd, gitops, platform-engineering</small>

Ten-plus clusters across four clouds, inconsistent deploys and no single pane of
glass. How we consolidated to four clusters under one hub-and-spoke ArgoCD control
plane — the topology, the GitOps layout, and the gotchas.

## [Vault HA on Kubernetes: auto-unseal, dynamic secrets, and a DR runbook](/blog/vault-ha-on-kubernetes)
<small>2026-06-27 · vault, kubernetes, security, secrets-management</small>

Vault is easy to demo and hard to run well. A production-minded setup: HA storage,
auto-unseal via cloud KMS, Kubernetes auth, dynamic secrets — and the disaster-recovery
runbook everyone skips.

---

*Want to compare notes on observability or platform engineering? See [About](/about).*
