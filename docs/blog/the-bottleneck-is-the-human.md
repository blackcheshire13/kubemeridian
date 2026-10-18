---
date: 2026-10-18
title: "The bottleneck is the human: a week when every agent worked and nothing shipped"
sidebarTitle: The bottleneck is the human
description: An autonomous development loop where every role behaved as designed — and two green one-line fixes waited six days. Why refusals by category never expire, and what deusex changed.
tags: [deusex, autonomous-development, agents, engineering-process]
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/the-bottleneck-is-the-human
---

# The bottleneck is the human

*2026-10-18 · deusex · autonomous-development · agents · engineering-process*

In September the autonomous loop that develops [ICE](/ice/) had a perfect week. Every role
ran on schedule. The lines opened pull requests, the critic reviewed them, the digests
reported in. Nothing crashed, nothing misbehaved.

And the project stood still.

## Two one-line fixes, six days

Two pull requests were green and one line long. They waited six days. Not
because anything was broken — because each loop, on meeting an obstacle, did exactly what
it had been told: hand it to the human and move on to the next item.

The obstacle was a category. *"This touches the loop's own machinery — a person should
look."* A refusal by category has a property that is easy to miss: **it never expires.**
Nothing that happens later makes the category untrue, so nothing ever unblocks the item.
Each refusal on its own was reasonable. Together they made one person the queue.

## The empty queue that looked like a finished product

The same week had a second symptom. The backlog was empty, and the loop concluded there was
nothing to do — while most rows of the capability table were still below *live*. From the
inside, an empty queue and a finished product look identical.

## What changed

**The owner became a role.** A coordinator now runs every two hours with read-only tools,
looks at the whole board and prints one move — hand out, merge, escalate, unblock. A script
executes the move. Every ten minutes a cheaper beat, with no model call at all, hands out
work that is already ready.

**Escalation needs evidence.** An escalation with fewer than two recorded attempts is
rejected. A repeat without new attempts inside the cool-down is rejected too. "Let a person
look" is no longer free.

**Merge rights got tiers instead of a category.** Ordinary changes are merged by the
critic. Guarded machinery — CI, the fence, the merge policy — is judged by a stronger
model. Only the *concept* — the method, the decision log, the merge policy function itself
— goes to a person, and then with an analysis of whether the change weakens a gate.

**An empty queue triggers a search.** When there is nothing to do, a convergence role with
no write tools compares the vision with the capability table and proposes the next gap.

## Did it work?

Over the 14 days to 18 October, 89% of the pull requests merged into ICE came from the
loop, the median time from opened to merged was 0.7 hours, and 92.6% of the lines it
merged 14–45 days ago are still in `main`. In the week of 14 September, the loop's share
was 25%.

The number that is still missed matters most: the loop itself files only 49–67% of new
backlog items, against a target of 70%. The human is no longer the queue — but still writes
a third to a half of what goes into it.

## The general lesson

If you put agents into a process, look at what they do when they are *unsure*. Forwarding
to a person feels safe, and it is — locally. Globally it turns the most expensive,
least available participant into a single-threaded scheduler. Give every refusal a
measurement it is waiting for, and an expiry.

---

*deusex is the loop behind ICE. Read [how it works](/deusex/) or the
[method](/deusex/method), or write to [qdrrag@gmail.com](mailto:qdrrag@gmail.com).*
