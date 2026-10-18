<script setup lang="ts">
import { data as posts } from '../posts.data';
import IceLoop from './IceLoop.vue';
import DeusexCycle from './DeusexCycle.vue';

const latest = posts.slice(0, 4);
</script>

<template>
  <div class="hub">
    <header class="intro">
      <p class="kicker"><img src="/devopstech.svg" alt="" width="22" height="22" />devopstech · an engineering workshop</p>
      <h1>Production engineering,<br /><span class="turn">closed loop.</span></h1>
      <p class="lede">
        I build the tools I want next to production: a defence system for Kubernetes that only
        calls a problem fixed once the cluster proves it, a development loop that ships code
        while I sleep, and an observability plugin that works the moment you install it.
      </p>
    </header>

    <section class="projects" aria-label="Projects">
      <article class="project ice">
        <div class="copy">
          <p class="meta"><span class="idx">01</span><span class="dot" aria-hidden="true"></span>In development · design partners wanted</p>
          <h2><a href="/ice/">ICE</a></h2>
          <p class="pitch">
            Active defence for Kubernetes. ICE turns findings and drift into GitOps pull requests
            a person approves — and keeps the case open until a measurement taken after the merge
            proves the fix.
          </p>
          <ul class="facts">
            <li>Writes only through pull requests — the operator has no write rights outside its own resources</li>
            <li><code>Unknown</code> counts as unmet; a failed source reports <em>unmeasured</em>, never <em>clean</em></li>
            <li>Three different detectors must agree before it proposes a runtime response</li>
          </ul>
          <p class="go"><a href="/ice/">How ICE works</a><a href="mailto:qdrrag@gmail.com?subject=ICE%20early%20access">Ask for early access</a></p>
        </div>
        <div class="figure"><IceLoop /></div>
      </article>

      <article class="project deusex">
        <div class="copy">
          <p class="meta"><span class="idx">02</span><span class="dot" aria-hidden="true"></span>Running around the clock on two projects · private</p>
          <h2><a href="/deusex/">deusex</a></h2>
          <p class="pitch">
            An autonomous development loop that turns a vision document into working, merged code.
            Agents plan, build, review and merge on a schedule; a person decides only the concept.
          </p>
          <ul class="facts">
            <li>89% of ICE's merges in the last two weeks came from the loop, 0.7 h median to merge</li>
            <li>Rights held by tooling: the owner has read-only tools, the merge policy is a function</li>
            <li>A machine never approves changes to the machine that approves changes</li>
          </ul>
          <p class="go"><a href="/deusex/">How deusex works</a><a href="mailto:qdrrag@gmail.com?subject=deusex">Talk about deusex</a></p>
        </div>
        <div class="figure"><DeusexCycle /></div>
      </article>

      <article class="project km">
        <p class="meta"><span class="idx">03</span><span class="dot" aria-hidden="true"></span>Open source · Apache-2.0 · install today</p>
        <div class="km-row">
          <h2><a href="/kubemeridian">KubeMeridian</a></h2>
          <p class="pitch">
            Kubernetes observability for Grafana in one app plugin: topology, curated dashboards,
            logs and traces inline, cost and right-sizing, RED and SLOs for any mesh or ingress.
          </p>
          <p class="go"><a href="/guide/install">Install</a><a href="/guide/introduction">Read the guide</a><a href="https://github.com/blackcheshire13/kubemeridian">GitHub</a></p>
        </div>
      </article>
    </section>

    <section class="writing" aria-labelledby="writing-h">
      <h2 id="writing-h">Writing</h2>
      <ol>
        <li v-for="p in latest" :key="p.url">
          <time :datetime="p.date">{{ p.date }}</time>
          <a :href="p.url">{{ p.title }}</a>
          <p>{{ p.description }}</p>
        </li>
      </ol>
      <p class="more"><a href="/blog/">All posts</a></p>
    </section>

    <section class="contact">
      <h2>Work with me</h2>
      <p>
        Running Kubernetes in production and want ICE on your cluster before it is public? Curious
        how deusex would handle your backlog? Need a hand with Grafana, Kubernetes cost or SLOs?
        Write to <a href="mailto:qdrrag@gmail.com">qdrrag@gmail.com</a> — or read more
        <a href="/about">about me</a>.
      </p>
    </section>
  </div>
</template>

<style scoped>
.hub {
  max-width: 1152px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 72px) 24px 96px;
  color: var(--vp-c-text-1);
}
h1,
h2 {
  font-family: var(--dt-font-display);
  letter-spacing: -0.02em;
  margin: 0;
  border: 0;
  padding: 0;
}
a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
a:hover { text-decoration-thickness: 2px; }

/* intro */
.intro { max-width: 820px; }
.kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.intro h1 {
  font-size: clamp(40px, 7.2vw, 84px);
  line-height: 0.98;
  font-weight: 800;
}
.turn {
  background-image: linear-gradient(transparent 70%, oklch(0.74 0.135 78 / 0.45) 70%);
  padding: 0 0.04em;
}
.lede {
  margin: 28px 0 0;
  max-width: 640px;
  font-size: clamp(17px, 1.6vw, 19px);
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* projects */
.projects {
  margin-top: clamp(56px, 9vw, 112px);
  border-top: 2px solid var(--vp-c-text-1);
}
.project {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 72px);
  padding: clamp(36px, 5vw, 56px) 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.project.deusex .figure { order: -1; }
.project.deusex { grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); }
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.idx {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
}
.ice { --accent: var(--dt-ice); }
.deusex { --accent: var(--dt-deusex); }
.km { --accent: var(--dt-km); }
.project h2 {
  font-size: clamp(34px, 4.6vw, 52px);
  line-height: 1;
  font-weight: 800;
}
.project h2 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.project h2 a:hover { color: var(--vp-c-brand-1); }
.pitch {
  margin: 18px 0 0;
  max-width: 600px;
  font-size: 18px;
  line-height: 1.6;
}
.facts {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  max-width: 600px;
}
.facts li {
  position: relative;
  padding: 7px 0 7px 22px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  border-top: 1px dashed var(--vp-c-divider);
}
.facts code {
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
  color: var(--vp-c-text-1);
}
.facts li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 16px;
  width: 9px;
  height: 2px;
  background: var(--accent);
}
.go {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 24px 0 0;
  font-size: 16px;
  font-weight: 600;
}
.go a:first-child::after { content: ' →'; }
.figure {
  align-self: center;
  padding: 28px 28px 24px;
  background: var(--dt-paper-2);
  border: 1px solid var(--vp-c-divider);
  --rail-accent: var(--accent);
}
.figure :deep(.rail) { --rail-accent: var(--accent); }

.project.km {
  display: block;
  padding-bottom: clamp(32px, 4vw, 48px);
}
.km-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px 40px;
  align-items: baseline;
}
.km-row .pitch,
.km-row .go { margin: 0; }
.km h2 { font-size: clamp(28px, 3.4vw, 38px); white-space: nowrap; }

/* writing */
.writing {
  margin-top: clamp(56px, 8vw, 96px);
  display: grid;
  grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1.55fr);
  gap: 24px 40px;
}
.writing h2,
.contact h2 { font-size: 28px; font-weight: 700; }
.writing ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
.writing li {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 4px 20px;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.writing li:first-child { border-top: 2px solid var(--vp-c-text-1); }
.writing time {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-2);
  padding-top: 3px;
}
.writing li a {
  font-family: var(--dt-font-display);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.writing li a:hover { color: var(--vp-c-brand-1); text-decoration: underline; }
.writing li p {
  grid-column: 2;
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}
.more {
  grid-column: 2;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.more a::after { content: ' →'; }

/* contact */
.contact {
  margin-top: clamp(56px, 8vw, 96px);
  padding: 32px 0 0;
  border-top: 2px solid var(--vp-c-text-1);
  display: grid;
  grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1.55fr);
  gap: 16px 40px;
}
.contact p {
  margin: 0;
  max-width: 680px;
  font-size: 18px;
  line-height: 1.6;
}

/* entrance */
@media (prefers-reduced-motion: no-preference) {
  .intro > *,
  .project {
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .intro h1 { animation-delay: 0.05s; }
  .intro .lede { animation-delay: 0.12s; }
  .project.ice { animation-delay: 0.2s; }
  .project.deusex { animation-delay: 0.28s; }
  .project.km { animation-delay: 0.36s; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* narrow screens */
@media (max-width: 860px) {
  .project,
  .project.deusex { grid-template-columns: minmax(0, 1fr); }
  .project.deusex .figure { order: 0; }
  .km-row,
  .writing,
  .contact { grid-template-columns: minmax(0, 1fr); }
  .more { grid-column: 1; }
}
@media (max-width: 520px) {
  .hub { padding-left: 16px; padding-right: 16px; }
  .writing li { grid-template-columns: minmax(0, 1fr); }
  .writing li p { grid-column: 1; }
  .figure { padding: 22px 18px 18px; }
}
</style>
