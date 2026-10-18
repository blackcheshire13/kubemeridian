---
date: 2026-10-18
title: "What I haven't handed to the machine yet"
sidebarTitle: What I haven't handed over
description: deusex runs most of my backlog around the clock; the goal is that I decide only the concept. As of October 2026, here is the honest remainder — what is solvable and just not done, and what no method will ever take off a person.
tags: [deusex, autonomous-development, agents, engineering-process]
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/what-i-have-not-handed-over
---

# What I haven't handed to the machine yet

*2026-10-18 · deusex · autonomous-development · agents*

[deusex](/deusex/) develops two projects, mostly without me in the inner loop. Its rule for
the human is short: *I hand over everything except the concept.* From 4 to 18 October my own
branches in the loop's repository were seven concept decisions, six working sessions, four
new backlog items and one CI change, while about three quarters of its merges — 57 of the
75 counted through the forge API on 18 October — came from the loop's own branches.

That rule is a goal, not a fact. This is the honest remainder, split by whether the method
can ever remove it.

## Solvable — just not done yet

**Choosing the next capability as a judgement.** Work is still filed reactively, from
problems on the board, and a separate mechanism moves towards the goal by taking the
nearest gap *by rule*, not by importance. So the part that judges only sees accidents, and
the part that steers towards the goal does not judge. That split is accidental, and it has
to go.

**Merging changes to the loop itself.** A machine does not approve changes to the machine
that approves changes. Today such a change waits for me. The fix is a second, independent
judge — not a weaker rule.

**Onboarding a new project.** It is manual. Everything it needs can be derived from the
vision document and a first measurement of the gap; the loop just cannot do it yet.

## Not solvable by any method

**Resources and access.** An expired session, a credential to an external system, an
approval in someone else's organisation, a payment. The loop can measure what the downtime
costs and ask with evidence. Only the owner can give.

**The goal.** The vision is the one thing that cannot be derived from a measurement.

## The thresholds are mine too

Progress towards the vision is measured by code, over 14-day windows: a claim above its
threshold is met, below it is a gap, and fewer than five events in the window is "I don't
know" rather than "met". The thresholds themselves are part of the concept: I change them,
and only between windows.

The reason is not modesty. A measure that the measured party can rewrite gets gamed: an
agent judged by markers it is allowed to edit will, sooner or later, edit the markers.

## How I'll know the remainder is shrinking

Count what landed, not what started. The numbers that matter are the cost of an accepted
task with all its attempts and reviews, the share accepted on the first attempt, whether the
code is still there after 14–45 days — and **minutes of a person per finished task**, the
one the whole method promises to reduce. The loop does not measure that last one yet. Until
it does, this list is the best measurement I have.

---

*Read [how deusex works](/deusex/) and [its method](/deusex/method), or write to
[qdrrag@gmail.com](mailto:qdrrag@gmail.com?subject=deusex).*
