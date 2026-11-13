---
title: About — Artur Stepanchenko
description: Artur Stepanchenko, DevOps and platform engineer. Builds ICE, Kubernetes security fixes as pull requests, and takes contract work on Kubernetes platforms.
updated: 2026-11-13
---

# About

<div class="dt-person">
  <img src="/about/artur.jpg" width="96" height="96" alt="Artur Stepanchenko">
  <div>
    <p class="dt-person-name">Artur Stepanchenko</p>
    <p class="dt-person-role">Senior DevOps / SRE / platform engineer · the engineer behind devopstech</p>
    <p class="dt-person-links"><a href="https://www.linkedin.com/in/black-cmd-devops">LinkedIn</a><a href="https://github.com/blackcheshire13">GitHub</a><a href="/feed.xml">RSS</a></p>
  </div>
</div>

I'm a **DevOps and platform engineer**. I build ICE and take contract work on Kubernetes
platforms, observability and cost.

13+ years in IT infrastructure, eight of them in DevOps: Kubernetes on AWS and bare metal,
GitOps with Argo CD, Terraform, Istio, Vault, and the Prometheus, Grafana, Loki and Tempo
stack. I built infrastructure from scratch at three crypto and fintech companies. When the
same problem in production comes back twice, I write a tool for it.

## Track record

- Consolidated 10+ Kubernetes clusters across four clouds into four, under one
  hub-and-spoke Argo CD control plane — [the write-up](/blog/consolidating-kubernetes-clusters).
- Scaled a crypto exchange from 2–3k to 15–20k requests per second on two EKS and two
  bare-metal Kubernetes clusters, with zero-downtime releases.
- Took a high-load platform from zero to a 20k rps peak within a year and cut its
  infrastructure cost by 20% with autoscaling and infrastructure as code.
- Ran Kubernetes in air-gapped enterprise networks under the customer's security and
  compliance rules.
- Since July 2026, building ICE and deusex.

## What I'm building

- **[ICE](/ice/)** — Kubernetes security fixes as pull requests. It turns findings and drift
  into GitOps pull requests a person approves, and keeps a case open until a new measurement
  shows the fix worked. In development; a [free pilot](/ice/design-partners) is open to up to
  five teams.
- **[deusex](/deusex/)** — an autonomous development loop that plans, builds, reviews and
  merges code on a schedule and stops only at the decisions people have not handed over.
  It develops ICE, and itself.
- **[KubeMeridian](/kubemeridian)** — Kubernetes observability for Grafana. Archived in
  October 2026.

## When to write to me

- You run Kubernetes without a security engineer and want to try ICE on your cluster.
- You need a contractor for a Kubernetes platform, observability, cost or SLOs.
- You build with autonomous development and want to compare notes on deusex.

<PartnerCta topic="general" variant="plain" />
