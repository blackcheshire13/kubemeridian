---
title: deusex — an autonomous development loop
description: deusex turns a vision document into working, merged code. Agents plan, build, review and merge on a schedule; a person decides only the concept.
---

# deusex

<p class="dt-lede">Agents can already write code. deusex teaches them to say no. It is an autonomous
development loop that turns a vision document into working, merged code — and leaves a person only the concept.</p>

<p class="dt-status"><span class="dt-dot deusex"></span>Running around the clock on two projects since September 2026 · private</p>

<PartnerCta topic="deusex" variant="buttons" :secondary="{ text: 'The method', href: '/deusex/method' }" />

The name is the joke in reverse: *deus ex machina* is the plot device that resolves a story
without earning it. deusex is built so that nothing reaches `main` that has not earned it.

## Code is the easy part

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

## Honest numbers

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

The one target that is still missed is the most telling: the loop does not yet find enough
of its own work. A person still files about half of deusex's backlog.

## What is not there yet

- **Starting a project from zero** is designed, not built: onboarding a project is manual
  today, and the bootstrap phase — the loop building its own fence, an assumptions log
  instead of questions to a person, a spending ceiling — exists only on paper.
- Pauses and daily budgets are not yet separated per project.
- Token cost is not measured by the loop itself yet.
- The UI-testing role is written and switched off.

## Interested?

deusex is private for now. If you want to see it run on a codebase of yours, or compare
notes on autonomous development:

<PartnerCta topic="deusex" />
