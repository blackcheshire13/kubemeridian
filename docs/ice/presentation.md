---
title: ICE presentation — the product in 14 slides
description: "The ICE presentation as a page: the problem, how ICE takes a finding to a fix, what works today, how it is built and what comes next."
seoTitle: "ICE presentation: the product in 14 slides"
outline: false
aside: false
wide: true
updated: 2026-11-13
---

# ICE in 14 slides

<p class="dt-lede">Kubernetes security for teams without a security engineer. ICE collects findings from
scanners and runtime sensors in one system, scores the risk and sends the fix as a pull request to your
repository. Figures as of 13 November 2026.</p>

<p class="dt-next"><a href="#try">Try it yourself</a><a href="/ice/">ICE overview</a></p>

<section class="dt-slide" id="problem" aria-labelledby="problem-h">
<p class="dt-slide-k"><span>01</span>The problem</p>
<h2 id="problem-h">Scanners find vulnerabilities, but small teams have no one to fix them</h2>
<ol class="dt-tiles steps">
<li><b>Scanners are connected</b></li>
<li><b>Reports pile up</b></li>
<li><b>No one has time to triage them</b></li>
<li><b>The CI gate is switched off to ship a release</b></li>
</ol>
<p class="dt-slide-sub">The companies ICE is built for:</p>
<ul class="dt-tiles">
<li><b>5–50 engineers</b>and no security specialist</li>
<li><b>No enterprise budget</b>Wiz, Prisma Cloud and Snyk Enterprise are sold to large companies</li>
<li><b>No time for noise</b>an alert that does not say what to do stops being read</li>
</ul>
</section>
<p class="dt-slide-note">The usual path of a small team: scanners are connected, reports pile up, nobody has time to
triage them, and the CI check is switched off to ship an urgent release. Formally the team has security
tooling; in practice nothing gets fixed.</p>

<section class="dt-slide" id="answer" aria-labelledby="answer-h">
<p class="dt-slide-k"><span>02</span>The answer</p>
<h2 id="answer-h">ICE takes a finding all the way to a fix</h2>
<ol class="dt-tiles steps">
<li><b>Collects</b>scanners, container runtime, logs, metrics</li>
<li><b>Detects</b>threats, by rules written as code</li>
<li><b>Investigates</b>who, from where, what else is affected</li>
<li><b>Decides</b>scores the risk and picks an action</li>
<li><b>Fixes</b>sends a pull request to your Git</li>
<li><b>Remembers</b>which findings people confirmed</li>
</ol>
<p class="dt-slide-sub">The last step feeds the first: people's decisions tune the detectors.</p>
</section>
<p class="dt-slide-note">ICE is designed from the end — from the action. Every signal has to say which action it
leads to and who performs it. From the findings people confirm and reject, ICE measures each detector's
precision and proposes to downgrade the weak ones.</p>

<section class="dt-slide" id="capabilities" aria-labelledby="capabilities-h">
<p class="dt-slide-k"><span>03</span>Capabilities</p>
<h2 id="capabilities-h">Ten security functions in one system</h2>
<ul class="dt-tiles">
<li><span class="dt-s live">live</span><b>Vulnerability scanning</b>Trivy or Grype; only findings that are new against the baseline</li>
<li><span class="dt-s live">live</span><b>Image composition</b>a CycloneDX SBOM: which libraries an image is built from</li>
<li><span class="dt-s live">live</span><b>Secrets and misconfigurations</b>with the exact place of the problem</li>
<li><span class="dt-s live">live</span><b>Runtime protection</b>Falco, 8 syscall detectors; Tetragon is tested</li>
<li><span class="dt-s live">live</span><b>Fixes as pull requests</b>on GitHub; GitLab is tested</li>
<li><span class="dt-s live">live</span><b>Access for AI agents</b>MCP, 9 read-only tools</li>
<li><span class="dt-s tested">tested</span><b>Configuration checks</b>21 requirements for clusters and servers</li>
<li><span class="dt-s tested">tested</span><b>Risk scoring</b>four levels, from green to red</li>
<li><span class="dt-s tested">tested</span><b>Audit journal</b>entries cannot be changed or deleted</li>
<li><span class="dt-s">catalogue</span><b>Compliance</b>PCI DSS 4.0, CIS Docker and CIS Kubernetes</li>
</ul>
<p class="dt-slide-sub"><em>live</em> — seen working on a live cluster · <em>tested</em> — covered by tests, not yet seen on a cluster · <em>catalogue</em> — requirements described</p>
</section>
<p class="dt-slide-note">Usually each of these is a separate product with its own console. In ICE they share one
finding model, one risk score and one memory; Trivy, Grype, Falco, Tetragon and Kyverno run inside as
replaceable modules. The statuses come from ICE's capability register.</p>

<section class="dt-slide" id="response" aria-labelledby="response-h">
<p class="dt-slide-k"><span>04</span>Response levels</p>
<h2 id="response-h">ICE does not block at once: the response grows with the risk</h2>
<div class="dt-stack levels">

| Level | When | What ICE does | Cost of a false alarm |
| --- | --- | --- | --- |
| <span class="dt-lvl green">Green</span> | all normal | watches | none |
| <span class="dt-lvl yellow">Yellow</span> | one odd signal | records the session, shows a captcha, lowers the rate limit | the user sees a captcha |
| <span class="dt-lvl orange">Orange</span> | signals add up to a known attack | sends a ready action; a person confirms it | a response in minutes or hours |
| <span class="dt-lvl red">Red</span> | a trap fired: almost no false alarms | acts from an allow-list without waiting, if you opted in; reports afterwards | a block |

</div>
<p class="dt-slide-sub">A false alarm at yellow costs the user a captcha, not a lost payment. Risk scoring and the
levels are covered by tests; the captcha and session capture exist only as an interface so far.</p>
</section>
<p class="dt-slide-note">The main risk of automatic blocking is a false alarm that loses a real customer's payment.
So ICE answers in steps, and risk accumulates on a specific service, user or address. ICE acts on its own only
at red, where false alarms are rare — for example, when a decoy is touched. Even then the change arrives as a
pull request.</p>

<section class="dt-slide" id="architecture" aria-labelledby="architecture-h">
<p class="dt-slide-k"><span>05</span>How it is built</p>
<h2 id="architecture-h">ICE has no rights to change your services: a fix arrives as a pull request</h2>
<ol class="dt-tiles flow">
<li><i>Your cluster</i><b>ICE agent</b>Only reads, and sends data out itself. The centre needs no keys to your cluster.</li>
<li><i>ICE centre</i><b>Server and console</b>Stores findings, scores risk, keeps the audit journal. A console with 13 sections and access for AI agents.</li>
<li><i>Your Git</i><b>Pull request</b>The fix arrives as a pull request. A person merges it.</li>
</ol>
<p class="dt-slide-sub">Plugs in as replaceable modules:</p>
<ul class="dt-chips">
<li>Trivy</li><li>Grype</li><li>Falco</li><li>Tetragon</li><li>Kyverno</li><li>Istio</li><li>Linkerd</li><li>Prometheus</li><li>Argo CD</li><li>GitHub</li><li>GitLab</li><li>any model with an Anthropic or OpenAI-compatible API</li>
</ul>
</section>
<p class="dt-slide-note">Security here rests on missing rights, not on promises. The agent in your cluster only reads
and pushes data out, so the centre holds no one's credentials. The centre is the ice-api server with
PostgreSQL, risk scoring and a Kubernetes operator. Every change goes to your Git as a pull request, and a
person merges it. Trivy can be swapped for Grype, Falco for Tetragon, one model for another. ICE installs
from one Helm chart; the <code>ice install</code> wizard passes tests and has not yet been run on a live cluster.</p>

<section class="dt-slide" id="console" aria-labelledby="console-h">
<p class="dt-slide-k"><span>06</span>The console</p>
<h2 id="console-h">Signals, risk and the fix on one screen</h2>
<figure class="dt-shot">
<a class="dt-light-only" href="/screenshots/ice/console-signals.png"><picture><source type="image/webp" srcset="/screenshots/ice/console-signals.webp"><img src="/screenshots/ice/console-signals.png" width="2370" height="1310" loading="lazy" alt="ICE console, Actions: a capture_session action at the red level with risk score 92, built from three signals — a trap on a canary table, a search for key files and a cluster API call from a pod — and the file that approving would put in a pull request."></picture></a><a class="dt-dark-only" href="/screenshots/ice/console-signals-dark.png"><picture><source type="image/webp" srcset="/screenshots/ice/console-signals-dark.webp"><img src="/screenshots/ice/console-signals-dark.png" width="2370" height="1310" loading="lazy" alt="ICE console, Actions: a capture_session action at the red level with risk score 92, built from three signals, and the file that approving would put in a pull request. Dark theme."></picture></a>
</figure>
<ol class="dt-tiles steps">
<li><b>Three different signals</b>someone read a decoy table, searched for key files and called the cluster API from a pod</li>
<li><b>Risk 92 of 100</b>the signals converge on one database user: the red level</li>
<li><b>A person decides</b>Approve opens a pull request; ICE has no direct write to the cluster</li>
</ol>
</section>
<p class="dt-slide-note">This is the Actions screen of the ICE console in demo mode: the company and data are
fictional, the console is the real one. ICE proposes a ready action — record the session — and shows the
file that will land in the repository; nothing changes until the pull request is merged. The path to the
pull request works on the live cluster; session capture itself exists only as an interface.
<a class="dt-ext" href="https://demo.devopstech.net" target="_blank" rel="noopener">Open the demo console</a> and click through it.</p>

<section class="dt-slide" id="portability" aria-labelledby="portability-h">
<p class="dt-slide-k"><span>07</span>Portability</p>
<h2 id="portability-h">A new project connects with one YAML file, without code changes</h2>
<div class="dt-split">

```yaml
# profiles/acme-corp.yaml, shortened
project: acme-corp
crown_jewels: [billing-api, identity-api]
repos:
  - url: github.com/acme-corp/widgets
    modules: [services/billing, services/identity]
scanner:
  kind: grype
scan_schedule: "0 6 * * *"
environments:
  - name: production
    cluster: acme-prod
    namespaces: [widgets]
```

<dl class="dt-nums">
<div><dt>33</dt><dd>detectors: 28 in the core packs for any project, 5 in a sample pack for payment platforms</dd></div>
<div><dt>21</dt><dd>requirements for clusters and servers, written as code</dd></div>
<div><dt>2</dt><dd>modes: full, with Kubernetes, and scanner-only, without it</dd></div>
</dl>
</div>
</section>
<p class="dt-slide-note">The test of the architecture: connecting a new project takes a YAML profile, not code. The
profile lists what is protected — important services, repositories, image registries, environments and
clusters. Detectors live in packs: 28 general ones, and a sample domain pack whose 5 detectors read the
money metrics a payment platform already emits; packs for fintech or e-commerce are written the same way.
The core rests on seven interfaces; everything else can be replaced.</p>

<section class="dt-slide" id="ai" aria-labelledby="ai-h">
<p class="dt-slide-k"><span>08</span>AI in the product</p>
<h2 id="ai-h">A language model explains findings but changes nothing itself</h2>
<ul class="dt-tiles">
<li><span class="dt-s tested">tested</span><b>AI analyst</b>Explains a finding and picks an action from a fixed list. It has no tools; personal data is removed before the model is called.</li>
<li><span class="dt-s live">live</span><b>MCP server</b>9 read-only tools: findings, settings, detectors, audit, trends. A company's AI agent, such as Claude, asks ICE directly.</li>
<li><span class="dt-s tested">tested</span><b>Learns from people's decisions</b>Measures each detector's precision from what people confirmed and rejected. Proposes to downgrade weak ones; a person decides.</li>
</ul>
<p class="dt-slide-sub">Any model with an Anthropic or OpenAI-compatible API works; the administrator sets the model address.</p>
</section>
<p class="dt-slide-note">AI works where it helps and gets no rights where a mistake is expensive. The analyst only
explains and picks from a list; the MCP server only reads, and approval stays with a person in the console.
Downgrading a detector stays a commit made by a person.</p>

<section class="dt-slide" id="speed" aria-labelledby="speed-h">
<p class="dt-slide-k"><span>09</span>How ICE is built</p>
<h2 id="speed-h">An autonomous AI loop writes most of ICE's code</h2>
<dl class="dt-nums">
<div><dt>805</dt><dd>commits to main since 27 July</dd></div>
<div><dt>161k</dt><dd>lines of code, 48% of them tests</dd></div>
<div><dt>1,920</dt><dd>test functions in Go, TypeScript and Python</dd></div>
<div><dt>152</dt><dd>roadmap items closed</dd></div>
</dl>
<figure class="dt-bars" aria-label="Commits to main per month">
<figcaption>Commits to main per month</figcaption>
<ol>
<li style="--v: 63"><b>63</b><span>Jul*</span></li>
<li style="--v: 187"><b>187</b><span>Aug</span></li>
<li style="--v: 171"><b>171</b><span>Sep</span></li>
<li style="--v: 262"><b>262</b><span>Oct</span></li>
<li style="--v: 122"><b>122</b><span>Nov*</span></li>
</ol>
<p>* partial months: from 27 July, and to 13 November</p>
</figure>
<p class="dt-slide-sub">Every change passes the tests and a review by a critic model. The founder sets the tasks
and decides disputed changes.</p>
</section>
<p class="dt-slide-note">ICE is developed by <a href="/deusex/">deusex</a>: five development lines on models from four
vendors, a coordinator that hands out roadmap items every 10 minutes, and a critic model without whose
approval nothing reaches main. From 19 October to 5 November, 88% of ICE's merges came from the loop.
Figures counted from the repository on 13 November 2026.</p>

<section class="dt-slide" id="maturity" aria-labelledby="maturity-h">
<p class="dt-slide-k"><span>10</span>Maturity</p>
<h2 id="maturity-h">16 of 91 capabilities already work on a live cluster</h2>
<dl class="dt-nums">
<div><dt>16</dt><dd>work on a live cluster: scans, SBOMs, runtime detection, fixes as pull requests, access for AI agents</dd></div>
<div><dt>71</dt><dd>are covered by tests but not yet checked on a cluster</dd></div>
<div><dt>4</dt><dd>are in progress: three have code without proof, one has only an interface</dd></div>
</dl>
<p class="dt-slide-sub">"Live" is set only after a check on our own test cluster, with dated evidence; the second
test cluster is not connected yet. No external teams run ICE yet: pilots come first.</p>
</section>
<p class="dt-slide-note">ICE keeps a register of 91 capabilities, each with one status. Tests alone never earn
"live", and CI fails if a live row has no dated evidence. The nearest work is to check the 71 tested
capabilities on pilot clusters. ICE does not replace a SIEM, and it acts on its own only at the red level.
<a href="/ice/#status">What works today, in detail</a>.</p>

<section class="dt-slide" id="landscape" aria-labelledby="landscape-h">
<p class="dt-slide-k"><span>11</span>Where ICE fits</p>
<h2 id="landscape-h">Between enterprise platforms and separate open-source tools</h2>
<div class="dt-stack landscape">

| | Wiz, Prisma Cloud | Trivy, Falco, Kyverno separately | ICE |
| --- | --- | --- | --- |
| Where it runs | the vendor's cloud | on your side, one tool per layer | on your side: one Helm chart and a YAML profile |
| Built for | large companies with a security team | teams ready to wire tools together | 5–50 engineers without a security engineer |
| Setup | an enterprise contract | free, but the wiring is yours | a Helm chart, then YAML edits |
| Result | one view of the risks | a separate report from each tool | a ready fix as a pull request |

</div>
<p class="dt-slide-sub">Trivy, Falco and Kyverno run inside ICE: it puts open-source tools together into one
system rather than competing with them.</p>
</section>
<p class="dt-slide-note">On one side, Wiz and Prisma Cloud run in the vendor's cloud and are built for companies
with their own security team and the budget for it. On the other, Trivy, Falco and Kyverno are free and each
covers its layer, but wiring them together is manual work that a small team has no people for. ICE runs on
your side, uses the same open-source engines and takes a finding to a ready fix.</p>

<section class="dt-slide" id="next" aria-labelledby="next-h">
<p class="dt-slide-k"><span>12</span>What comes next</p>
<h2 id="next-h">Next: from our own test cluster to external teams</h2>
<ol class="dt-tiles steps">
<li><b>Today</b>16 capabilities work on a live cluster; 276 commits to main in the last 30 days</li>
<li><b>Release 1.0</b>versions, tags and a public Helm chart instead of builds from main</li>
<li><b>Pilots</b>up to five external teams; capabilities move from tested to live on their clusters</li>
<li><b>Active response</b>the captcha and session capture at the edge, from interface to working code</li>
<li><b>Compliance reports</b>PCI DSS and CIS</li>
</ol>
<p class="dt-slide-sub">The order is set; the dates depend on how the pilots go.</p>
</section>

<section class="dt-slide" id="team" aria-labelledby="team-h">
<p class="dt-slide-k"><span>13</span>Team</p>
<h2 id="team-h">One person and five AI models</h2>
<ul class="dt-tiles">
<li><i>founder</i><b><a href="/about">Artur Stepanchenko</a></b>Sets the tasks, designs the architecture, decides disputed changes</li>
<li><i>Anthropic</i><b>Claude Opus 5</b>Two development lines, the test cluster, merging, finding new tasks, testing</li>
<li><i>Z.ai</i><b>GLM-5.3</b>A development line and the critic: without its approval, code does not reach main</li>
<li><i>MiniMax</i><b>MiniMax-M3</b>A development line</li>
<li><i>Moonshot AI</i><b>Kimi K3</b>A development line</li>
<li><i>Anthropic · "Spark"</i><b>Claude Opus 5.5</b>Infrastructure, CI and analysis of the loop's failures, together with the founder</li>
</ul>
<p class="dt-slide-sub">The weak spot: product decisions rest with one person. The loop also works at night without
the founder, but the founder sets the direction.</p>
</section>
<p class="dt-slide-note">The vendors differ on purpose: the models check each other's work, and an outage at one
provider does not stop development.</p>

<section class="dt-slide" id="try" aria-labelledby="try-h">
<p class="dt-slide-k"><span>14</span>Try it</p>
<h2 id="try-h">See ICE on fictional data, then on your own cluster</h2>
<ul class="dt-tiles">
<li><b>Demo console</b>The real ICE console on a made-up company, acme-corp. No sign-up.<a class="dt-ext" href="https://demo.devopstech.net" target="_blank" rel="noopener">Open the demo</a></li>
<li><b>Free pilot</b>Up to five teams, eight weeks, on your own Kubernetes, before the public release.<a href="/ice/design-partners">What a pilot involves</a></li>
</ul>
<p class="dt-cta"><a class="dt-btn" href="/ice/design-partners#apply">Apply for a free pilot</a></p>
</section>
