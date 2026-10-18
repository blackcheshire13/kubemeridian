---
date: 2026-10-18
title: "Live needs evidence: how ICE keeps its own feature list honest"
sidebarTitle: Live needs evidence
description: A security product that promises to call the unverified unverified has to apply the rule to itself. Five capability statuses, a dated evidence mark that CI enforces, and the five rows that lost their live status the day after the gate landed.
tags: [ice, engineering-process, testing, honesty]
head:
  - - link
    - rel: canonical
      href: https://devopstech.net/blog/live-needs-evidence
---

# Live needs evidence

*2026-10-18 · ice · engineering-process · testing*

[ICE](/ice/) promises one thing above all: what has not been checked is *called* unchecked.
`Unknown` counts as unmet, a failed source reports *unmeasured*, not *clean*. In August an
external audit pointed out the uncomfortable part — the project's own documentation was
breaking that promise.

Not out of bad faith. Contract, design and implementation were written side by side, in the
same words, and the docs described a more mature system than the one that ran. A product
whose pitch is honesty about coverage cannot have a feature list with that problem. So the
feature list got the same treatment as a cluster.

## Five statuses, one table of truth

Every capability lives in a single table, and every claim elsewhere — "ICE can", "ICE
learns" — must be checkable against it. If they disagree, the table wins.

| Status | Means |
| --- | --- |
| live | passed on a running cluster, with an observable consequence |
| tested | code plus a test that fails without it; not seen on a cluster |
| implemented | code exists, no test pins it |
| contract | a schema or type exists — there is no executor; vocabulary, not behaviour |
| planned | only a roadmap item |

The status describes the capability, not the code quality. `contract` is not worse than
`live`. Calling `contract` "working" is.

## A checkbox is a claim nothing re-checks

The weak point was the word **live**. It used to be set by flipping a cell, and the only
thing behind the flip was the commit message that flipped it — the author's paraphrase, not
the artefact. The next reader could not tell an observation from a flipped box.

Now a CI gate refuses a `live` row without a dated evidence mark of this shape (translated
here — the repository writes it in its own language):

```text
[evidence YYYY-MM-DD <reference>]
```

The reference has to take the form of something a reader can open: a pull request number, a
commit SHA of accepted length, or an entry id in the test cluster's run journal. The date is
parsed as a real calendar day, so `2026-02-30` fails. A date without a reference fails too:
that is exactly the shape of a box being ticked. The gate checks the form, not that the
artefact exists — it makes a fake deliberate, not accidental.

## The day after the gate landed

The gate went in on 9 October with the fifteen rows that were already `live` on an explicit
debt list. On 10 October the list was emptied, and five rows lost their `live` status: the
baseline posture, the agent's outbound push, drift-to-fix proposals, finding storage with
history and triage, and CVE database freshness. Nothing about them had broken — they were
re-read against the new rule. For four of them the only record of an observation was prose
in a commit; for the fifth there was not even that. Without an artefact a reader could open,
they became `tested`, which was the truth.
`live` went from 15 rows to 10.

The feature list got less impressive and more useful. As of 18 October 2026 it reads
10 live, 63 tested, 3 implemented and 1 contract, and each of the ten live rows carries its
evidence mark.

## Vocabulary pretending to be a feature

A second gate catches a quieter version of the same problem. For the project's first two and
a half weeks the profile schema offered six kinds of container registry while every scan
called exactly one. Nobody
noticed, because nothing was looking: a value a profile may set but no code reads is not
extensibility, it is vocabulary pretending to be a feature.

Now every enumerated value in the API must either be read somewhere in the code, or be
declared in the capability table as a dated contract without an executor. It is a floor,
not a ceiling — a literal can sit in a comment — but it catches precisely the case the
project actually suffered.

## Why bother

Because the reader of a security tool makes decisions on its claims. A dashboard that is
green for the wrong reasons is worse than one that is honestly grey. The same is true of
the README.

---

*ICE is looking for design partners — see [the overview](/ice/) or write to
[qdrrag@gmail.com](mailto:qdrrag@gmail.com?subject=ICE%20design%20partner).*
