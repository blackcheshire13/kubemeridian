---
title: deusex — an autonomous development loop
description: deusex is an autonomous development loop. AI agents plan, write, review and merge code on a schedule; a person decides the concept. It builds ICE.
updated: 2026-11-13
---

# deusex

<p class="dt-lede">deusex is an autonomous development loop. AI agents plan, write, review and merge code on
a schedule; a person writes the vision and decides what the loop is not allowed to decide. It builds ICE, and
itself.</p>

<p class="dt-status"><span class="dt-dot deusex"></span>Running around the clock on two projects since September 2026 · private</p>

<p class="dt-next"><a href="/deusex/method">The method</a><a href="/ice/">What it builds: ICE</a></p>

## Writing code is solved; running a project is not

Generating a pull request is solved. Running a project is three harder problems:

- knowing **what to do next**;
- stopping what must not reach `main` — **cheaply, early, and with a named reason**;
- telling **"checked"** apart from **"nobody looked"**.

And the real bottleneck is not the model. It is the person everything gets forwarded to.
In one week in September every loop worked exactly as designed — and the project stood
still. Two green one-line fixes waited six days, because each loop, on hitting an
obstacle, handed it to the human and moved on. The refusals were by category ("touches the
machinery — let a person look"), so they never expired. deusex is the answer to that week.

## The loop

<div class="dt-figure deusex"><DeusexCycle /></div>

Every role is a separate run with separate rights, and the rights are held by tooling, not
by instructions. The roles are described on the [method page](/deusex/method).

## Who may merge — three tiers

1. **Ordinary change** — the critic on a base model judges and merges it itself.
2. **Guarded machinery** — CI, the fence, the merge policy, the judge, the registries.
   Judged and merged by the critic on a stronger model.
3. **Concept, or "not sure"** — the method, the decision log and a few named functions,
   such as the merge policy itself. A person decides. The model only writes them an
   analysis of whether the change strengthens or weakens a gate — without a verdict.

If the list of guarded paths cannot be read, *everything* counts as guarded.

<p class="dt-quote">A machine does not approve changes to the machine that approves changes.</p>

## Numbers for 4–18 October 2026

Counted from the git history and the forge API on **18 October 2026**, over the 14 days
from 4 to 18 October. "Autonomous" means a pull request from a loop branch; everything
else was started by a person — also with AI help, but on human initiative.

<div class="dt-stack numbers">

| Measure | deusex | ICE | Target |
| --- | ---: | ---: | ---: |
| Merged pull requests that came from the loop | 57 / 75 · 76% | 66 / 74 · 89% | ≥ 80% |
| Merged on the first attempt, no "changes requested" | 46 / 57 · 81% | 58 / 66 · 88% | ≥ 70% |
| Median time, opened → merged | 3.8 h | 0.7 h | ≤ 12 h |
| Lines of autonomous merges still in `main` after 14–45 days | 95.1% | 92.6% | ≥ 90% |
| New backlog items filed by the loop itself | 20 / 41 · 49% | 29 / 43 · 67% | ≥ 70% |
| Reverts, whole history | 0 | 1 | — |

</div>

The loop's share of ICE's merges grew from **25%** in the week of 14 September to **83–100%**
in each week since; deusex itself went from 12% to 74–78% once it became its own project.
About half of the loop's merges in the last 30 days came from models other than the
primary one. The loop's own code is 34 scripts — and more lines of tests than of code,
1,226 test functions.

One target is still missed: the loop does not find enough of its own work. A person still
files about half of deusex's backlog.

## What is not there yet

- **Starting a project from zero** is designed, not built: onboarding a project is manual
  today, and the bootstrap phase — the loop building its own fence, an assumptions log
  instead of questions to a person, a spending ceiling — exists only on paper.
- Pauses and daily budgets are not yet separated per project.
- Token cost is measured only for the workers whose session logs the loop can read (since 25 October).
- The UI-testing role is written and switched off.

## What it builds

deusex is private and not a product; what it builds is [ICE](/ice/). If you run Kubernetes,
[pilot ICE on your cluster](/ice/design-partners). To compare notes on autonomous development,
write to me:

<PartnerCta topic="deusex" variant="address" />

The name reverses *deus ex machina*, the plot device that resolves a story without earning
it: in deusex, nothing reaches `main` without passing its gates.
