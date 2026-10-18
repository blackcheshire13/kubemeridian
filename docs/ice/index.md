---
title: ICE — Kubernetes active defence with GitOps remediation
description: ICE is active defence for Kubernetes. Findings and drift become GitOps pull requests a person approves, and a case closes only when a fresh measurement proves the fix.
---

# ICE: active defence for Kubernetes

<p class="dt-lede">Not a scanner — a loop. ICE turns findings and drift into GitOps pull requests a
person approves, and calls a problem fixed only when a measurement taken <em>after</em> the merge says so.</p>

<dl class="dt-glance">
  <div><dt>Who it's for</dt><dd>Teams of 5–50 engineers where one or two people own the infrastructure and there is no dedicated security team.</dd></div>
  <div><dt>What you get</dt><dd>Findings that arrive as reviewable pull requests, and cases that close only when the cluster proves the fix.</dd></div>
  <div><dt>Where it stands</dt><dd>In development since July 2026, to be open-sourced under Apache-2.0. Looking for design partners.</dd></div>
</dl>

<p class="dt-strip"><span class="dt-s live"><strong>10</strong>&nbsp;live</span><span class="dt-s tested"><strong>63</strong>&nbsp;tested</span><span class="dt-s implemented"><strong>3</strong>&nbsp;implemented</span><span class="dt-s"><strong>1</strong>&nbsp;contract</span><span>capabilities as of 18 October 2026 · <a href="#honest-status">what that means</a></span></p>

<PartnerCta variant="buttons" :secondary="{ text: 'How ICE works', href: '/ice/how-it-works' }" />

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

The estate can be mixed: managed Kubernetes, bare-metal Kubernetes and plain servers.

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

- **Writes go through pull requests — because there is nothing else.** Outside its own
  resources the operator can only `get` and `list`; tests check that matrix against a real
  kube-apiserver authorizer — no secrets, no `pods/exec`, no impersonation.
- **`Unknown` counts as unmet.** A verdict older than its cadence drops to `Unknown`; a
  failed source reports *unmeasured*, never *clean*.
- **A rule whose alert cannot be delivered is not loaded** — and the pack's status says why.
- **One signal is not an action.** A runtime response needs three *different* detectors to
  agree, only for assets you marked as crown jewels; acting on a client IP needs the "client
  IP is trusted" precondition measured as met.
- **The model advises; it has no hands.** An optional LLM explains entities; it has no tools,
  PII redaction cannot be turned off, and it never changes a detector's weight. The MCP
  interface is read-only, off by default, and marks every answer as untrusted data.
- **No Black ICE.** The name is cyberpunk's *intrusion countermeasures electronics*,
  popularised by William Gibson's *Neuromancer* — minus the counter-attack. Every response
  targets the estate it protects.
- **The product does not know its test clusters.** A CI gate keeps proving-ground names out
  of the product; portability is checked against a synthetic company.

[The detail behind each principle →](/ice/how-it-works)

## Works with the stack you already run

ICE does not replace your detection or policy tools — it takes their output and decides
what to do with it, then proves whether it worked.

<div class="dt-stack integrations">

| Your tool | What ICE does with it | Status |
| --- | --- | --- |
| Falco, Tetragon | receives syscall events as runtime signals | <span class="dt-s live">live (Falco)</span> |
| Trivy, Grype | scheduled image scans with a delta to the accepted baseline; CycloneDX SBOMs | <span class="dt-s live">live (scans)</span> |
| GitHub | remediation pull requests opened from a console approval | <span class="dt-s live">live</span> |
| GitLab | the same pull-request flow on a second forge | <span class="dt-s tested">tested</span> |
| Argo CD | a case is `deployed` only when the application is Synced on the merge revision | <span class="dt-s tested">tested</span> |
| Prometheus, Alertmanager | PromQL detectors as generated `PrometheusRule` objects — one of eleven renders today, and the generator names its reason for each refusal; alerts reach the agent | <span class="dt-s tested">tested</span> |
| Loki | LogQL detectors are defined but need a Loki ruler to run | <span class="dt-s">not yet</span> |
| Kyverno | reads `PolicyReport` objects as posture facts; proposes policies in audit mode only | <span class="dt-s tested">tested</span> |
| Istio, Linkerd | posture checks and authorisation-by-service-account responses | <span class="dt-s tested">tested</span> |
| OIDC | console sign-in and the approver role, including providers other than Keycloak | <span class="dt-s tested">tested</span> |
| MCP clients | read-only tools for AI assistants, off by default | <span class="dt-s live">live</span> |

</div>

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
| <span class="dt-s live">live</span> | 10 | observed on a real cluster, with dated evidence |
| <span class="dt-s tested">tested</span> | 63 | covered by tests against envtest and a real PostgreSQL |
| <span class="dt-s implemented">implemented</span> | 3 | code exists, tests are partial |
| <span class="dt-s">contract</span> | 1 | the interface is fixed, there is no executor yet |

**Live today:** daily image scans with a delta to baseline and provenance; syscall detectors
via Falco; console approval that opens a real GitOps pull request; the read-only MCP; a daily
automated walk-through of the console.

**Not there yet:** the full case up to *verified* passes in tests but has not been watched
end-to-end on a live cluster; the second proving-ground cluster is not connected; there are
no tagged releases; one trust domain per installation, no multi-tenancy.

## Questions

<details class="dt-faq"><summary>Is ICE a scanner?</summary>
<p>No. Scans are one input. ICE runs from detection to a verified fix: findings become pull requests a person approves, and a case closes only on a measurement taken after the merge.</p>
</details>
<details class="dt-faq"><summary>Does ICE change my cluster?</summary>
<p>Not directly. The operator has no write rights outside its own resources; changes reach the cluster as pull requests to your GitOps repository, and your pipeline applies them. The one exception to <em>human approval</em> is a trap response, and only if you opt in — even then the change arrives as a pull request.</p>
</details>
<details class="dt-faq"><summary>Does it replace Falco or Kyverno?</summary>
<p>No — it consumes what they report and turns it into decisions, pull requests and verified outcomes.</p>
</details>
<details class="dt-faq"><summary>Is ICE open source?</summary>
<p>It will be released under Apache-2.0. Until then it is developed in private, with design partners.</p>
</details>
<details class="dt-faq"><summary>Where does it run?</summary>
<p>On any Kubernetes cluster, with a collector for plain servers. A local trial on <code>kind</code> takes 15–20 minutes.</p>
</details>

## Become a design partner

I'm looking for teams running Kubernetes in production that want the loop on their estate
before the public release — and will tell me where it hurts.
[What a pilot involves →](/ice/design-partners)

<PartnerCta />
