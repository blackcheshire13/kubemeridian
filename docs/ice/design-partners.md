---
title: ICE design partners — run the loop on your cluster early
description: What an ICE design-partner pilot involves — a local trial, a read-only agent, pull requests you approve and merge — what leaves your cluster, and what it needs.
---

# Design partners

<p class="dt-lede">ICE is built on real estates, not fixtures. A design partner runs the loop on their own
Kubernetes before the public release, and tells me where it is noisy, missing or wrong.</p>

<PartnerCta variant="buttons" :secondary="{ text: 'What ICE is', href: '/ice/' }" />

## What you get

- **The loop on your estate early** — findings and drift turned into pull requests you
  review, and cases that close only when a fresh measurement proves the fix.
- **A direct line to the engineer building it.** Your feedback goes straight into the
  backlog.
- **A say in what gets built next.** Capabilities move from *tested* to *live* on clusters
  like yours — that is exactly what the pilot is for.

## How a pilot goes

<Flow accent="var(--dt-ice)" :steps="[
  { label: 'Try it locally', note: 'kind + a synthetic company profile, 15–20 minutes' },
  { label: 'Read-only agent', note: 'in a test or staging cluster; it pushes facts out' },
  { label: 'Review findings', who: 'human', note: 'in the console, with the reasons behind each' },
  { label: 'Approve a change', who: 'human', note: 'a rendered, digest-pinned pull request' },
  { label: 'Merge and measure', who: 'measure', note: 'the case closes only on a fresh measurement' },
]" />

## What leaves your cluster, and what can change it

- The agent runs inside your cluster with `list` on workloads, network policies, config
  maps, mesh policies and policy reports — **no secrets, no exec, no port-forward, no
  writes** — and sends facts out. ICE never holds a kubeconfig for your clusters.
- The operator can write only to ICE's own resources. Every change to your workloads is a
  **pull request to your GitOps repository** that you merge and your pipeline applies. You
  approve each one — the only exception is a trap response, and only if you opt in.
- To confirm a merge was deployed, the operator reads Argo CD `Application` status
  (`get` and `list`, nothing else).
- The optional model has no tools, PII redaction cannot be turned off, and the provider
  address has to be allow-listed by whoever runs the installation. The MCP interface is
  read-only and off by default.
- One installation is one trust domain; there is no multi-tenancy yet.

## What it needs

| You run | Needed? |
| --- | --- |
| Kubernetes (managed or bare-metal) | yes |
| A GitOps repository on GitHub | yes — GitLab is tested, not yet live |
| Argo CD | to let ICE confirm a merge was deployed (tested, not yet live) |
| Image scans in CI (Trivy or Grype) | for vulnerability findings |
| Falco or Tetragon | for runtime signals |
| Prometheus and Alertmanager, Kyverno, Istio or Linkerd | optional — each adds detectors or posture facts |

## Interested?

Tell me about your estate — the cluster count, the GitOps setup, and what you would want ICE
to catch first.

<PartnerCta />
