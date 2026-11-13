---
title: ICE — Kubernetes security fixes as GitOps pull requests
description: "ICE turns Kubernetes findings and drift into GitOps pull requests a person approves, and closes a case only on a measurement newer than the merge."
updated: 2026-11-13
---

# ICE: Kubernetes security fixes as pull requests

<p class="dt-lede">ICE collects findings from your scanners, runtime sensors and policy tools, turns each
one it can fix into a pull request to your GitOps repository, and closes the case only after it measures
the cluster again.</p>

<dl class="dt-glance">
  <div><dt>Who it's for</dt><dd>Teams of 5–50 engineers where one or two people run the infrastructure and nobody works on security full-time.</dd></div>
  <div><dt>What you get</dt><dd>A pull request with the fix instead of a report, and a case that closes only when the cluster shows the fix worked.</dd></div>
  <div><dt>Where it stands</dt><dd>In development since July 2026; 16 of 91 capabilities work on a live cluster. No external teams run it yet. Apache-2.0 at release.</dd></div>
</dl>

<p class="dt-strip"><span class="dt-s live"><strong>16</strong>&nbsp;live</span><span class="dt-s tested"><strong>71</strong>&nbsp;tested</span><span class="dt-s implemented"><strong>3</strong>&nbsp;implemented</span><span class="dt-s"><strong>1</strong>&nbsp;contract</span><span>capabilities as of 13 November 2026 · <a href="#status">what that means</a></span></p>

<p class="dt-next"><a href="/ice/how-it-works">How ICE works</a><a href="/ice/presentation">ICE in 14 slides</a><a href="/ice/design-partners">The free pilot</a></p>

## Scanners find problems; small teams have no one to fix them

A common path: the team connects scanners, the reports pile up, nobody has time to triage
them, and the CI gate is switched off to ship an urgent release. The scanners keep running;
nothing gets fixed.

ICE starts from the fix. A detector's signal enters ICE only if it answers three questions:

1. **What** is the action?
2. **Who** performs it?
3. **Why** are we sure?

A detector that cannot answer all three is rejected, and its pack shows the reason. ICE also
keeps "missing" apart from "broken": if you don't run a service mesh, ICE says so — it does
not report your mesh as insecure.

ICE works across managed Kubernetes, bare-metal Kubernetes and plain servers.

## How a case closes

<div class="dt-figure ice"><IceLoop /></div>

**Merged is not deployed, and deployed is not fixed.** A case moves through fixed states. The
last two are set by a measurement, not by anyone's word:

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
person approved, the action fails instead of shipping a change nobody reviewed.

## What it looks like

<p class="dt-shots-note">The real ICE console with <strong>fictional data</strong> for a made-up company, acme-corp.
<a class="dt-ext" href="https://demo.devopstech.net" target="_blank" rel="noopener">Open the demo console</a> and click through it yourself.</p>

<figure class="dt-shot">
  <a class="dt-light-only" href="/screenshots/ice/action-approval.png"><picture><source type="image/webp" srcset="/screenshots/ice/action-approval.webp"><img src="/screenshots/ice/action-approval.png" width="1440" height="836" loading="lazy" alt="ICE console, Actions: a posture remediation awaiting approval, with the evidence, the rendered NetworkPolicy and what merging it does; Approve opens a pull request."></picture></a><a class="dt-dark-only" href="/screenshots/ice/action-approval-dark.png"><picture><source type="image/webp" srcset="/screenshots/ice/action-approval-dark.webp"><img src="/screenshots/ice/action-approval-dark.png" width="1440" height="836" loading="lazy" alt="ICE console, Actions: a posture remediation awaiting approval, with the evidence, the rendered NetworkPolicy and what merging it does; Approve opens a pull request. Dark theme."></picture></a>
  <figcaption><strong>Approve a change, not a description.</strong> The rendered manifest and what merging it does; approving opens a pull request — ICE has no direct write path to the cluster.</figcaption>
</figure>

<figure class="dt-shot">
  <a class="dt-light-only" href="/screenshots/ice/cases.png"><picture><source type="image/webp" srcset="/screenshots/ice/cases.webp"><img src="/screenshots/ice/cases.png" width="1440" height="900" loading="lazy" alt="ICE console, Cases: one case verified after a re-check, one merged and deployed but not verified because the requirement has not been measured since the merge."></picture></a><a class="dt-dark-only" href="/screenshots/ice/cases-dark.png"><picture><source type="image/webp" srcset="/screenshots/ice/cases-dark.webp"><img src="/screenshots/ice/cases-dark.png" width="1440" height="900" loading="lazy" alt="ICE console, Cases: one case verified after a re-check, one merged and deployed but not verified because the requirement has not been measured since the merge. Dark theme."></picture></a>
  <figcaption><strong>Merged is not fixed.</strong> A case reaches <em>verified</em> only after a re-check; the second one stays <em>deployed, not verified</em> until the requirement is measured again.</figcaption>
</figure>

<figure class="dt-shot">
  <a class="dt-light-only" href="/screenshots/ice/posture.png"><picture><source type="image/webp" srcset="/screenshots/ice/posture.webp"><img src="/screenshots/ice/posture.png" width="1440" height="900" loading="lazy" alt="ICE console, Posture: compliance score with met, unmet, not checked and not applicable requirements per environment."></picture></a><a class="dt-dark-only" href="/screenshots/ice/posture-dark.png"><picture><source type="image/webp" srcset="/screenshots/ice/posture-dark.webp"><img src="/screenshots/ice/posture-dark.png" width="1440" height="900" loading="lazy" alt="ICE console, Posture: compliance score with met, unmet, not checked and not applicable requirements per environment. Dark theme."></picture></a>
  <figcaption><strong>Posture as requirements.</strong> Not checked counts against the score; not applicable is left out of it.</figcaption>
</figure>

## Guarantees held by code, not by promises

- **ICE cannot change your workloads directly.** Every change is a pull request you merge.
  Outside its own resources the operator can only `get` and `list`; tests check that against
  a real kube-apiserver authorizer — no secrets, no `pods/exec`, no impersonation.
- **"Not measured" is never shown as "clean".** A verdict older than its cadence drops to
  `Unknown`, which counts as unmet; a failed source reports *unmeasured*.
- **A rule whose alert cannot be delivered is not loaded**, and the pack's status says why.
- **One alert does not trigger a response.** A runtime response needs three *different*
  detectors to agree, and only for assets you marked as crown jewels; acting on a client IP
  needs the "client IP is trusted" precondition measured as met.
- **The model explains; it cannot act.** An optional LLM explains entities. It has no tools,
  PII redaction cannot be turned off, and it never changes a detector's weight. The MCP
  interface is read-only, off by default, and marks every answer as untrusted data.
- **Responses change only the estate ICE protects.** Each response type names what it
  changes — your edge config, your telemetry or your workloads — and a test fails on any
  other target. There is no counter-attack. Live since 12 November 2026.
- **Nothing is tailored to the clusters ICE is tested on.** A CI gate keeps their names out
  of the product, and portability is checked against a fictional company.

[How each guarantee is enforced →](/ice/how-it-works)

## Works with the stack you already run

ICE does not replace your detection or policy tools. It takes their output, decides what to
do with it and checks whether the fix worked.

<div class="dt-stack integrations">

| Your tool | What ICE does with it | Status |
| --- | --- | --- |
| Falco, Tetragon | receives syscall events as runtime signals | <span class="dt-s live">live (Falco)</span> |
| Trivy, Grype | scheduled image scans with a delta to the accepted baseline; CycloneDX SBOMs from Trivy | <span class="dt-s live">live</span> |
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

*live* means seen working on a running cluster, with dated evidence; *tested* means covered
by tests but not yet seen on a cluster — the same scale as in [What works today](#status).

## What works today {#status}

A capability is marked **live** only with dated evidence from a running cluster; CI fails if
the evidence is missing. The day after this rule arrived, five capabilities went back from
*live* to *tested*: nobody could show the evidence.

As of **13 November 2026**, out of 91 capabilities:

| Status | Capabilities | Meaning |
| --- | ---: | --- |
| <span class="dt-s live">live</span> | 16 | seen working on a real cluster, with dated evidence |
| <span class="dt-s tested">tested</span> | 71 | covered by tests against envtest and a real PostgreSQL |
| <span class="dt-s implemented">implemented</span> | 3 | code exists, tests are partial |
| <span class="dt-s">contract</span> | 1 | the interface is fixed, there is no executor yet |

**Live:** daily image scans with a delta to baseline and provenance, including images a
profile declares without cluster access; a CycloneDX SBOM for every scanned source; a
findings queue split into vulnerabilities, misconfigurations and secrets; the age of each CVE
database next to the findings; syscall detectors via Falco; console approval that opens a real
GitOps pull request; responses limited to the estate ICE protects; the read-only MCP; a daily
automated walk-through of the console. What changed lately is in [News](/news/).

**Not there yet:**

- no external team runs ICE yet — the pilot is the first step;
- the full case up to *verified* passes in tests but has not been watched end-to-end on a
  live cluster;
- the second test cluster is not connected;
- no tagged releases: images are built from every merge to `main`;
- one trust domain per installation, no multi-tenancy.

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
<p>It will be released under Apache-2.0. Until then the source is private; pilot teams run the published images.</p>
</details>
<details class="dt-faq"><summary>What does it cost?</summary>
<p>The pilot is free. ICE will be released under Apache-2.0, so you keep what you run.</p>
</details>
<details class="dt-faq"><summary>Where does it run?</summary>
<p>On any Kubernetes cluster, with a collector for plain servers. A local trial on <code>kind</code> takes 15–20 minutes.</p>
</details>

## Free pilot on your cluster

Up to five teams, eight weeks, free. You run ICE on your own Kubernetes before the public
release and tell me where it is noisy, missing or wrong.
[What a pilot involves →](/ice/design-partners)

<p class="dt-cta"><a class="dt-btn" href="/ice/design-partners#apply">Apply for a free pilot</a></p>
