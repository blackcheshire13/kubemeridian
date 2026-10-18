<script setup lang="ts">
import { data as posts } from '../posts.data';
import IceLoop from './IceLoop.vue';
import DeusexCycle from './DeusexCycle.vue';
import PartnerCta from './PartnerCta.vue';

const latest = posts.slice(0, 4);
</script>

<template>
  <div class="hub">
    <header class="intro">
      <div class="intro-main">
        <p class="kicker">devopstech · an engineering workshop</p>
        <h1>Production engineering,<br /><span class="turn">closed loop.</span></h1>
        <p class="lede">
          I build <a href="/ice/">ICE</a>, active defence for Kubernetes that only calls a problem
          fixed once the cluster proves it — and <a href="/deusex/">deusex</a>, the autonomous
          development loop that builds it.
        </p>
        <PartnerCta variant="buttons" :secondary="{ text: 'How ICE works', href: '/ice/' }" />
      </div>

      <aside class="now" aria-label="Where things stand">
        <h2>Now</h2>
        <ul>
          <li>
            <span class="dt-s live" aria-hidden="true"></span>
            <span><strong>ICE</strong> — 10 capabilities live on a real cluster, 63 tested; looking for design partners.</span>
          </li>
          <li>
            <span class="dt-s live" aria-hidden="true"></span>
            <span><strong>deusex</strong> — 89% of ICE's merges came from the loop, 0.7&nbsp;h median to merge.</span>
          </li>
          <li v-if="latest[0]">
            <span class="dt-s" aria-hidden="true"></span>
            <span><strong>Latest</strong> — <a :href="latest[0].url">{{ latest[0].title }}</a></span>
          </li>
        </ul>
        <p class="asof">As of 18 October 2026 · figures for 4–18 October</p>
      </aside>
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
          <p class="go"><a href="/ice/">How ICE works</a><a href="/ice/design-partners">Design partners</a></p>
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
            <li>4–18 October: 89% of ICE's merges came from the loop, with a 0.7&nbsp;h median to merge</li>
            <li>Rights held by tooling: the owner has read-only tools, the merge policy is a function</li>
            <li>A machine never approves changes to the machine that approves changes</li>
          </ul>
          <p class="go"><a href="/deusex/">How deusex works</a><a href="/deusex/method">The method</a></p>
        </div>
        <div class="figure"><DeusexCycle /></div>
      </article>

      <p class="archive">
        <span class="label">Archive</span>
        <a href="/kubemeridian">KubeMeridian</a> — Kubernetes observability for Grafana, archived in
        October 2026.
      </p>
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

    <section class="contact" aria-labelledby="contact-h">
      <h2 id="contact-h">Work with me</h2>
      <div>
        <PartnerCta
          variant="plain"
          lead="Running Kubernetes in production? Get the ICE loop on your cluster before the public release — or talk to me about deusex, Kubernetes, observability, cost and SLOs."
        />
        <p class="about-link"><a href="/about">About me</a></p>
      </div>
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

/* intro: statement + actions on the left, a dated "now" panel on the right */
.intro {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 40px clamp(32px, 6vw, 88px);
  align-items: end;
}
.kicker {
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
  background-image: linear-gradient(transparent 70%, color-mix(in oklch, var(--dt-brass) 45%, transparent) 70%);
  padding: 0 0.04em;
}
:global(.dark) .turn {
  /* on dark paper a wide marker turns muddy: a thin brass rule instead */
  background-image: linear-gradient(transparent 88%, var(--dt-brass) 88%, var(--dt-brass) 94%, transparent 94%);
}
.lede {
  margin: 28px 0 28px;
  max-width: 600px;
  font-size: clamp(18px, 1.6vw, 20px);
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
.lede a { font-weight: 600; }

.now {
  padding-top: 14px;
  border-top: 2px solid var(--vp-c-text-1);
}
.now h2 {
  font-size: 18px;
  font-weight: 700;
}
.now ul {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
}
.now li {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
}
.now li strong { color: var(--vp-c-text-1); }
.now li .dt-s { padding-top: 1px; }
.now li .dt-s::before { margin-right: 0; }
.asof {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* projects */
.projects {
  margin-top: clamp(56px, 9vw, 104px);
  border-top: 2px solid var(--vp-c-text-1);
}
.project {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 72px);
  padding: clamp(36px, 5vw, 56px) 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
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
  gap: 4px 24px;
  margin: 20px 0 0;
  font-size: 16px;
  font-weight: 600;
}
.go a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.go a:first-child::after { content: ' →'; white-space: pre; }
.figure {
  align-self: start;
  padding: 28px 28px 24px;
  background: var(--dt-paper-2);
  border: 1px solid var(--vp-c-divider);
}

.archive {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 0;
  padding: 22px 0;
  font-size: 16px;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}
.archive .label {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.archive a { font-weight: 600; }

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
.more a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.more a::after { content: ' →'; white-space: pre; }

/* contact */
.contact {
  margin-top: clamp(56px, 8vw, 96px);
  padding: 28px 0 0;
  border-top: 2px solid var(--vp-c-text-1);
  display: grid;
  grid-template-columns: minmax(160px, 0.45fr) minmax(0, 1.55fr);
  gap: 16px 40px;
}
.about-link {
  margin: 16px 0 0;
  font-size: 16px;
  font-weight: 600;
}
.about-link a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}

/* entrance */
@media (prefers-reduced-motion: no-preference) {
  .intro > *,
  .project {
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .intro .now { animation-delay: 0.12s; }
  .project.ice { animation-delay: 0.2s; }
  .project.deusex { animation-delay: 0.28s; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* narrow screens */
@media (max-width: 960px) {
  .intro { grid-template-columns: minmax(0, 1fr); align-items: start; }
}
@media (max-width: 860px) {
  .project { grid-template-columns: minmax(0, 1fr); }
  .writing,
  .contact { grid-template-columns: minmax(0, 1fr); }
  .more { grid-column: 1; }
}
@media (max-width: 520px) {
  .hub { padding-left: 16px; padding-right: 16px; }
  .writing li { grid-template-columns: minmax(0, 1fr); }
  .writing li p { grid-column: 1; }
  .figure { padding: 20px 16px 16px; }
  /* on a phone the loop reads as its step names; the details live on the product pages */
  .figure :deep(.detail) { display: none; }
  .figure :deep(li) { padding-bottom: 10px; }
}
</style>
