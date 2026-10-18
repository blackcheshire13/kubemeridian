---
title: How ICE is built
description: The components of ICE — operator, API, console, agent and scan pipeline — the trust path from a read-only agent to a GitOps pull request, posture states and the response catalogue.
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/ice/how-it-works
---

# How ICE is built

ICE is a Kubernetes operator with an API, a console and a small agent. It stores facts,
proposes changes and checks their outcome — but it never applies a change to your cluster
itself. Your GitOps pipeline does that.

## The trust path

<Flow accent="var(--dt-ice)" :steps="[
  { label: 'Agent', note: 'read-only, inside your cluster, pushes facts out' },
  { label: 'ICE API', note: 'stores facts; holds no kubeconfigs' },
  { label: 'Operator', note: 'proposes an action; no write rights outside ICE' },
  { label: 'Approval', who: 'human', note: 'a person with the approver role' },
  { label: 'Pull request', note: 'GitHub or GitLab, in your GitOps repo' },
  { label: 'Argo CD', note: 'syncs the merge revision' },
  { label: 'Measured again', who: 'measure', note: 'the case can close' },
]" />

The agent is a subcommand of the same binary. It runs inside the target cluster with
`list` on workloads, network policies, config maps, mesh policies and policy reports — no
secrets, no exec, no port-forward, no writes — and it calls out to ICE. The centre never
holds a kubeconfig for your clusters.

## Components

**ice-operator** — kubebuilder v4 and controller-runtime, API group
`ice.devopstech.net/v1alpha1`, four custom resources:

| Resource | What it declares |
| --- | --- |
| `IceProfile` | the estate: what runs where, cadences, crown jewels, where the GitOps repo is |
| `IcePack` | a set of detectors and requirements, with a coverage report of what is switched off and why |
| `IcePosture` | requirements as code and their current state |
| `IceAction` | a proposed change, from render and digest to the fate of its pull request |

The operator reconciles profiles, turns an unmet requirement into an `IceAction`, turns an
approved action into a pull request, and polls that pull request every five minutes.

**ice-api** — REST with OIDC. It accepts scans, posture facts and runtime signals, is the
only writer to PostgreSQL, and publishes the status of the custom resources. Findings are
rows in PostgreSQL, not custom resources — together with their history, triage with
expiry, risk scores and an append-only journal enforced by database grants.

**Console** — React, English and Russian: findings, actions, cases, entities and risk,
scans, SBOMs, posture, detectors, modules and the journal.

**Scan pipeline** — trivy and grype against your registries, a delta to the accepted
baseline, CycloneDX SBOMs. It runs from *your* CI as a composite action, so the product
itself never needs pull access to your registry.

## Packs and detectors

The core ships nine packs with 28 detectors and 20 requirements. Detectors written in
PromQL are rendered into `PrometheusRule` objects: your Prometheus evaluates them and your
Alertmanager delivers the alert to the agent. Syscall events come from Falco or Tetragon.

Every detector must answer the three questions — what is the action, who performs it, why
are we sure. A signal that cannot is rejected on arrival with a `422`, and the pack carries
a condition explaining why.

## Posture

A requirement is always in exactly one of seven states:

| State | Meaning |
| --- | --- |
| Met | measured and satisfied |
| Drifted | was met, the live state moved away |
| Unmet | measured and not satisfied |
| NotApplicable | does not apply here — accepted only with a reason, and left out of the compliance percentage |
| Unknown | not measured within its cadence; counts as unmet |
| Waived | consciously accepted, with an expiry date |
| Blocked | cannot be measured until something else is fixed |

Facts come from the agent's own checks (network policies, Pod Security admission, Istio
and Linkerd), from other tools' `PolicyReport` objects such as Kyverno's, and from a
collector for plain servers.

## Responses

The catalogue of renderers is closed — six templates today: default-deny ingress and
egress, Pod Security privileged level, Istio and Linkerd authorisation by service
account, and Kyverno in audit mode only. Rendering is deterministic, so the same input
always gives the same digest, and the digest is what a person approves.

Runtime risk is scored per entity and decays over time. The higher levels need at least
three different detectors to agree in a window. Traps are the only path that may act
without a person — and only when a decoy is hit, the profile has explicitly opted in,
the preconditions are measured as met and the run is not a dry run.

## Who ICE is for, and the two modes

- **Full** — operator, agent, posture, actions and verified closure.
- **Scanner-only** — the scan pipeline and findings, for teams that want the signal first
  and the loop later.

Both run on a laptop with `kind` in 15–20 minutes, from a synthetic company profile.

<p class="dt-cta">Interested in running ICE early? <a href="mailto:qdrrag@gmail.com?subject=ICE%20design%20partner">Become a design partner</a> · <a href="/ice/">Back to the overview</a></p>
