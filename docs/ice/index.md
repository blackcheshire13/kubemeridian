---
title: ICE — Kubernetes active defence with GitOps remediation
description: ICE is active defence for Kubernetes. Findings and drift become GitOps pull requests a person approves, and a case closes only when a fresh measurement proves the fix.
---

# ICE: active defence for Kubernetes

<p class="dt-lede">Not a scanner — a loop. ICE turns findings and drift into GitOps pull requests that a
person approves, and calls a problem fixed only when a measurement taken <em>after</em> the merge says so.</p>

<p class="dt-status"><span class="dt-dot ice"></span>In development since July 2026 · will be open-sourced under Apache-2.0 · <a href="mailto:qdrrag@gmail.com?subject=ICE%20design%20partner">design partners wanted</a></p>

## Why another security tool

You switch a scanner on, and nobody reads its reports. The channel with 400 findings is
muted by day three. The CI gate is ripped out during the first hotfix. What is left is
security on paper.

ICE starts from the other end — from the **action**. Every signal has to answer three
questions before it is allowed into the system:

1. **What** is the action?
2. **Who** performs it?
3. **Why** are we sure?

A detector that cannot answer all three is rejected when its signal arrives, and the reason
shows up on its pack. A missing component is never reported as a broken requirement:
"you don't run a service mesh" and "your mesh is configured insecurely" are different
statements, and ICE keeps them apart.

It is built for teams of 5–50 engineers where one or two people own the infrastructure,
there is no dedicated security team, and the estate is mixed: managed Kubernetes,
bare-metal Kubernetes and plain servers.

## The loop

<div class="dt-figure ice"><IceLoop /></div>

**Merged is not deployed, and deployed is not fixed.** A remediation case walks through
explicit states, and the last two are earned, not declared:

<Flow accent="var(--dt-ice)" :steps="[
  { label: 'open', who: 'machine', note: 'a requirement is unmet' },
  { label: 'proposed', who: 'machine', note: 'rendered change + digest' },
  { label: 'approved', who: 'human', note: 'in the console' },
  { label: 'delivered', who: 'machine', note: 'pull request opened' },
  { label: 'merged', who: 'human', note: 'your review, your repo' },
  { label: 'deployed', who: 'measure', note: 'Argo CD Synced on the merge revision' },
  { label: 'verified', who: 'measure', note: 'a measurement newer than the merge' },
]" :exits="['rejected — stays on record', 'drift — the case reopens', 'not measured since the merge — not verified']" />

Before a change is applied, ICE renders it again. If the digest no longer matches what the
person approved, the action fails instead of shipping something nobody reviewed.

## Principles enforced by code, not by discipline

**Writes go through pull requests — because there is nothing else.** The operator can
write only to ICE's own resources; outside its API group it can `get` and `list`, nothing
more. The permission matrix is checked in tests against a real kube-apiserver authorizer:
no listing secrets, no `pods/exec`, no impersonation.

**`Unknown` counts as unmet.** A verdict that is older than its declared cadence is
downgraded to `Unknown`. A source that fails reports *unmeasured*, never *clean*. An
unknown requirement in a pack disables the detector instead of passing silently.

**A rule whose alert cannot be delivered is not loaded.** If the profile declares that the
log ruler has no alert delivery, the whole log pack switches off and says why in its status. The rule generator
refuses to render detectors it cannot back, and names the reason for each one.

**One signal is not an action.** A response to runtime behaviour needs at least three
*different* detectors to agree inside a time window, and is proposed only for the assets
you marked as crown jewels. Acting on a client IP is allowed only when the "client IP is
trusted" precondition has been *measured* as met.

**The model advises; it has no hands.** An optional LLM can explain an entity to a human.
It has no tools, PII redaction cannot be turned off, and its suggestions never change a
detector's weight — reading attacker-controlled text must not turn prompt injection into
rule injection. The MCP interface is read-only, off by default, and marks every answer as
untrusted data.

**No Black ICE.** Every kind of response names its target inside the estate it protects.
ICE never reaches out to anything else.

**The product does not know its test clusters.** A CI gate rejects any change that leaks a
proving-ground name into the product, and portability is checked against a synthetic
company profile.

## Works with the stack you already run

ICE does not replace your detection or policy tools — it takes their output and decides
what to do with it, then proves whether it worked.

| Your tool | What ICE does with it | Status |
| --- | --- | --- |
| Falco, Tetragon | receives syscall events as runtime signals | live (Falco) |
| Trivy, Grype | scheduled image scans with a delta to the accepted baseline; CycloneDX SBOMs | live (scans) |
| GitHub | remediation pull requests opened from a console approval | live |
| GitLab | the same pull-request flow on a second forge | tested |
| Argo CD | a case is `deployed` only when the application is Synced on the merge revision | tested |
| Prometheus, Alertmanager | PromQL detectors as generated `PrometheusRule` objects — one of eleven renders today, and the generator names its reason for each refusal; alerts reach the agent | tested |
| Loki | LogQL detectors are defined but need a Loki ruler to run | not yet |
| Kyverno | reads `PolicyReport` objects as posture facts; proposes policies in audit mode only | tested |
| Istio, Linkerd | posture checks and authorisation-by-service-account responses | tested |
| OIDC | console sign-in and the approver role, including providers other than Keycloak | tested |
| MCP clients | read-only tools for AI assistants, off by default | live |

*live* means observed on a running cluster with dated evidence; *tested* means covered by
tests but not yet seen on a cluster — the same scale as in [Honest status](#honest-status).

## Honest status

ICE has its own rule for honesty: a capability can be marked **live** only with dated
evidence from a running cluster, and CI fails if the evidence is missing. The day after that
rule arrived, five rows were downgraded from *live* to *tested* — nobody could produce the
evidence.

As of **18 October 2026**:

| Status | Capabilities | Meaning |
| --- | ---: | --- |
| live | 10 | observed on a real cluster, with dated evidence |
| tested | 63 | covered by tests against envtest and a real PostgreSQL |
| implemented | 3 | code exists, tests are partial |
| contract | 1 | the interface is fixed, there is no executor yet |

**Live today:** daily image scans with a delta to baseline and provenance; syscall detectors
via Falco; console approval that opens a real GitOps pull request; the read-only MCP; a daily
automated walk-through of the console.

**Not there yet:** the full case up to *verified* passes in tests but has not been watched
end-to-end on a live cluster; the second proving-ground cluster is not connected; there are
no tagged releases; one trust domain per installation, no multi-tenancy.

## Questions

**Is ICE a scanner?** No. Scans are one input. ICE runs from detection to a verified fix:
findings become pull requests a person approves, and a case closes only on a measurement
taken after the merge.

**Does ICE change my cluster?** Not directly. The operator has no write rights outside its
own resources; changes reach the cluster as pull requests to your GitOps repository, and
your pipeline applies them. The one exception to *human approval* is a trap response, and
only if you opt in — even then the change arrives as a pull request.

**Does it replace Falco or Kyverno?** No — it consumes what they report and turns it into
decisions, pull requests and verified outcomes.

**Is ICE open source?** It will be released under Apache-2.0. Until then it is developed in
private, with design partners.

**Where does it run?** On any Kubernetes cluster, with a collector for plain servers. A
local trial on `kind` takes 15–20 minutes.

## Want ICE on your cluster?

I'm looking for **design partners**: a team running Kubernetes in production that wants the
loop on its estate before the public release, and will tell me where it hurts.
Write to [qdrrag@gmail.com](mailto:qdrrag@gmail.com?subject=ICE%20design%20partner).

Next: [how ICE works →](/ice/how-it-works)
