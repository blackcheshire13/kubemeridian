---
title: The deusex method — roles and invariants
description: The roles of the deusex loop and what holds each one's rights, the merge policy written as code, and the invariants — each one added after a concrete failure.
---

# The method

The rule lives in code; judgement lives in the prompt. Every role below is a separate run
with its own rights, and wherever a right matters it is held by tooling — an allow-list of
tools, a hook, a function — rather than by asking the model nicely.

## Roles

<div class="dt-stack roles">

| Role | Decides | What holds its rights | Cadence |
| --- | --- | --- | --- |
| Vision | the goal | written by a person, rarely; for the loop itself the vision is its own method | — |
| Owner | what to move, what to merge, whom to hand work to, when to escalate | read-only tools; prints **one** move per run, a script executes it | every 2 h |
| Beat | hands out ready work | the same script, no model call | every 10 min |
| Lines | one backlog item → one pull request | five lines on models from four providers; non-primary models run code-only; an item is claimed by a lease | every 5 h |
| Critic | is this diff good enough | merges only on approval, green CI and no conflict, pinned to the reviewed commit; on a person's pull request it only advises | per PR |
| Convergence | which gap to close next | no write tools at all; three possible moves; runs only on an empty queue, at most daily | ≤ daily |
| Watcher | does the capability work on the live system | read-only token; four verdicts, including "a precondition was missing" | per project |
| Scout | how others solve the same problem | brings one idea with the source's licence; never copies foreign code | ~3.5 days |
| Audit | an independent look at everything merged in a day | a model from another provider, read-only sandbox; advisory | daily |
| Digests | the day and the week | metrics and code survival | daily, weekly |

</div>

Each run checks out a snapshot of the loop's own `main` and logs its version: what runs is
always text that went through review.

## The merge policy is a function

Before anything is merged, one function decides — and it is part of the concept, so only a
person may change it:

- drafts and pull requests that conflict with `main` are refused;
- **zero checks means "still running", not "passed"**; failed and unfinished checks refuse;
- a pull request must be at least two hours old and at most 4,000 lines;
- a change to the loop's own scripts merges only with a test in the same diff;
- a CI workflow change is limited to 40 lines.

The backlog is a plain file in the project with a fixed vocabulary of statuses. An item
gets three attempts, then becomes `blocked` with a diagnosis. An escalation with fewer than
two recorded attempts is rejected, and so is a repeat without new attempts inside the
cool-down.

## Invariants

Every one of these was added after a concrete failure, not in advance.

**A read has three outcomes, not two:** "no", "this many" and "I don't know". A failed read
is never reported as "nothing there".

**A gate is enforced by code, not by a request.** A licence requirement written only in a
prompt would let a copyleft licence through silently.

**The fence holds before execution.** A pre-tool hook refuses a single command and names
the reason, instead of discarding a whole run after the fact — before it, three runs in a
row and fifteen finished verdicts went to waste. A broken hook refuses; it never lets
things through.

**A gate that falsely accuses costs more than a missing one.** Gates are added after a real
failure, not pre-emptively.

**An escalation needs attempts; a request for resources needs evidence.**

**"Waiting" is expressed only by an item's status**, never by text inside it.

**A test must be able to fail — and that is checked by mutation.** About one commit in four
in the loop's history records the mutation its test was checked against.

**A test stub behaves like the real reader**, rather than echoing the expected result.

**A primitive that refuses "usually" is not compare-and-set.** Two leases on one item once
produced byte-identical commits, and the second push answered "up-to-date" with exit code 0.
The fix put the run's identity into the commit, and a test pins it.

**A migration ends with deleting the second copy** and every mention of the old paths.

**A measure the measured party can rewrite will be gamed.** Thresholds are part of the
concept: a person changes them, and only between measurement windows.

**A machine does not approve changes to the machine that approves changes.** Hence the
three tiers of merge rights.

**Count what landed, not what started.** The number of pull requests and lines of code
both lie.

## What a person keeps

For good: the goal, the weight between projects, money and access, and irreversible
actions. For now: a second judge for changes to the loop itself, onboarding a new project,
and a spending budget.

<PartnerCta topic="deusex" lead="Want to see deusex run on a codebase of yours?" />
