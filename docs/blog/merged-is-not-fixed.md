---
date: 2026-10-18
title: "Merged is not deployed, deployed is not fixed"
sidebarTitle: Merged is not fixed
description: Why ICE closes a security finding only on a measurement taken after the merge — and how Argo CD's sync revision, freshness cadences and Unknown-as-unmet keep the loop honest.
tags: [ice, kubernetes, gitops, security]
---

# Merged is not deployed, deployed is not fixed

*2026-10-18 · ice · kubernetes · gitops · security*

Most security tooling ends at a ticket. A scanner finds something, someone opens a pull
request, the pull request is merged — and the finding is marked resolved. Three
assumptions hide in that last step, and in a GitOps estate each of them is regularly wrong:

1. **The merge reached the cluster.** Argo CD may be out of sync, the application may
   point at another branch, the sync may have failed on an unrelated resource.
2. **What reached the cluster is what was reviewed.** Between approval and merge the
   change can be rebased, edited or regenerated.
3. **The cluster now satisfies the requirement.** A network policy can be applied and
   still not select the pods it was meant for.

In [ICE](/ice/) a remediation case does not trust any of them. It moves through explicit
states, and the last two can only be set by evidence.

<Flow accent="var(--dt-ice)" :steps="[
  { label: 'proposed', who: 'machine', note: 'rendered change + digest' },
  { label: 'approved', who: 'human' },
  { label: 'delivered', who: 'machine', note: 'pull request opened' },
  { label: 'merged', who: 'human' },
  { label: 'deployed', who: 'measure', note: 'Synced on the merge revision' },
  { label: 'verified', who: 'measure', note: 'measured after the merge' },
]" />

## Approve a digest, not a description

A person approves a *rendered* change. Rendering is deterministic, so the same input
always produces the same bytes, and the approval is bound to their digest. Before the
operator opens the pull request it renders the change again; if the digest differs from
the approved one, the action fails. Nothing ships that a human did not see.

## Deployed means Argo CD says so — for that revision

`deployed` is not inferred from the merge. ICE reads the Argo CD `Application` that owns
the target and waits for `status.sync.revision` to equal the merge commit with the
application `Synced`. A merge into a branch the application does not track never becomes
`deployed`, and that is exactly the case a human would miss.

## Verified means measured after the merge

The last step needs a **fresh measurement**: a posture check, scan or agent report whose
timestamp is later than the merge. A measurement from before the merge cannot verify a
case even if it happens to be green. Until a fresh one arrives the case sits at
`deployed` and says so.

Freshness has a second edge. Every requirement declares a cadence; when the latest
verdict is older than that cadence it is downgraded to `Unknown`, and **`Unknown` counts
as unmet**. A requirement does not stay green just because nobody looked.

## Silence is not success

The same rule runs through the rest of the system:

- a scan source that fails reports *unmeasured*, never *clean*;
- a detector whose alert has nowhere to go is not loaded at all — and the pack status
  says why;
- a requirement for a component you don't run is *NotApplicable* with a reason, not a
  failure, so the score measures your configuration, not your architecture choices.

## What this costs

Honesty takes longer. A case that would be "resolved" in most tools stays open for a
cadence or two in ICE, waiting for a measurement. That is the point: the open case is
true, and the resolved ticket often is not.

---

*ICE is in development and looking for design partners — see [the overview](/ice/) or
write to [qdrrag@gmail.com](mailto:qdrrag@gmail.com).*
