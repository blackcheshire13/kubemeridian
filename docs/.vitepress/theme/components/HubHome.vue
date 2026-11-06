<script setup lang="ts">
// Home of ICE. One container (1104px between 24/32px gutters, as every other page), one
// vertical rhythm (--dt-section-gap between sections), one type scale (--dt-h1/--dt-h2),
// one primary action. Sections: hero, where ICE stands, how a case closes, how ICE is
// built, news, writing, pilot.
import { data as posts } from '../posts.data';
import NewsList from './NewsList.vue';
import IceLoop from './IceLoop.vue';

const latest = posts.slice(0, 4);
</script>

<template>
  <div class="hub">
    <header class="intro">
      <div class="intro-main">
        <p class="kicker"><strong>ICE</strong> · Kubernetes security for teams without a security team</p>
        <h1>Security fixes that prove they worked.</h1>
        <p class="lede">
          Findings become GitOps pull requests you approve. A case closes only when the cluster
          proves the fix.
        </p>
        <div class="actions">
          <a class="dt-btn" href="/ice/design-partners">Become a design partner</a>
          <p class="dt-next"><a href="/ice/how-it-works">How ICE works</a></p>
        </div>
      </div>

      <figure class="intro-shot">
        <a href="/ice/#what-it-looks-like">
          <!-- the console in the site's theme; on a phone, the one card that matters instead of a blur -->
          <picture class="dt-light-only">
            <source media="(max-width: 640px)" type="image/webp" srcset="/screenshots/ice/action-approval-card.webp" width="816" height="233" />
            <source media="(max-width: 640px)" srcset="/screenshots/ice/action-approval-card.png" width="816" height="233" />
            <source type="image/webp" srcset="/screenshots/ice/action-approval.webp" />
            <img
              src="/screenshots/ice/action-approval.png"
              alt="ICE console: a proposed remediation waiting for approval, with Approve and Deny"
              width="1440"
              height="836"
            />
          </picture>
          <picture class="dt-dark-only">
            <source media="(max-width: 640px)" type="image/webp" srcset="/screenshots/ice/action-approval-card-dark.webp" width="816" height="233" />
            <source media="(max-width: 640px)" srcset="/screenshots/ice/action-approval-card-dark.png" width="816" height="233" />
            <source type="image/webp" srcset="/screenshots/ice/action-approval-dark.webp" />
            <img
              src="/screenshots/ice/action-approval-dark.png"
              alt="ICE console in its dark theme: a proposed remediation waiting for approval, with Approve and Deny"
              width="1440"
              height="836"
            />
          </picture>
        </a>
        <figcaption>The ICE console, a change waiting for approval. Synthetic demo data.</figcaption>
      </figure>
    </header>

    <section class="stats" aria-label="Where ICE stands">
      <dl>
        <div>
          <dt>13</dt>
          <dd>capabilities live on a real cluster</dd>
        </div>
        <div>
          <dt>66</dt>
          <dd>more covered by tests, not yet seen live</dd>
        </div>
        <div>
          <dt>88%</dt>
          <dd>of ICE's merges come from deusex, the loop that builds it</dd>
        </div>
      </dl>
      <p class="asof">
        As of 6 November 2026; loop figures for 19 October – 5 November.
        <a href="/ice/#honest-status">What live and tested mean</a>
      </p>
    </section>

    <section class="block" aria-labelledby="loop-h">
      <div class="two">
        <div class="copy">
          <h2 id="loop-h">A case closes on proof, not on merge</h2>
          <p class="pitch">
            Every signal has to say what the action is, who performs it and why ICE is sure before it
            enters the system. Changes reach your workloads only as pull requests to your GitOps
            repository, and a merged fix stays open until the cluster is measured again.
          </p>
          <ul class="facts">
            <li>Writes only through pull requests — the operator has no write rights outside its own resources</li>
            <li><code>Unknown</code> counts as unmet; a failed source reports <em>unmeasured</em>, never <em>clean</em></li>
            <li>Three different detectors must agree before it proposes a runtime response</li>
          </ul>
          <p class="dt-next"><a href="/ice/how-it-works">How ICE works</a></p>
        </div>
        <div class="figure"><IceLoop /></div>
      </div>
    </section>

    <section class="block" aria-labelledby="built-h">
      <h2 id="built-h">How ICE is built</h2>
      <p class="pitch">
        ICE is developed by <a href="/deusex/">deusex</a>, an autonomous loop: agents plan, build,
        review and merge on a schedule, and a person decides the concept. From 19 October to
        5 November, 88% of ICE's merges came from the loop, with a 33-minute median from opened to
        merged.
      </p>
      <p class="dt-next"><a href="/deusex/">How deusex works</a></p>
    </section>

    <section class="block" aria-labelledby="news-h">
      <h2 id="news-h">News</h2>
      <NewsList compact :limit="4" />
      <p class="dt-next"><a href="/news/">All news</a></p>
    </section>

    <section class="block" aria-labelledby="writing-h">
      <h2 id="writing-h">Writing</h2>
      <ol class="posts">
        <li v-for="p in latest" :key="p.url">
          <time :datetime="p.date">{{ p.date }}</time>
          <a :href="p.url">{{ p.title }}</a>
          <p>{{ p.description }}</p>
        </li>
      </ol>
      <p class="dt-next"><a href="/blog/">All posts</a></p>
    </section>

    <section class="block contact" aria-labelledby="contact-h">
      <h2 id="contact-h">Pilot ICE</h2>
      <p class="pitch">
        Running Kubernetes in production without a security team? Run the loop on your cluster
        before the public release, and tell me where it is noisy, missing or wrong. Up to five teams,
        eight weeks, free: the button opens a short form, and I reply within two working days.
      </p>
      <p class="actions"><a class="dt-btn" href="/ice/design-partners#apply">Become a design partner</a></p>
      <p class="byline">
        ICE is built by <a href="/about">Artur Stepanchenko</a>, who also takes contract work on
        Kubernetes platforms, observability and cost.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* the site's one container: 1104px of content between VitePress's gutters (24px, 32px from 768px) */
.hub {
  max-width: calc(1104px + 64px);
  margin: 0 auto;
  padding: clamp(32px, 6vw, 72px) 32px var(--dt-section-gap);
  color: var(--vp-c-text-1);
}
h1,
h2 {
  font-family: var(--dt-font-display);
  letter-spacing: -0.02em;
  margin: 0;
  border: 0;
  padding: 0;
  text-wrap: balance;
}
h2 {
  font-size: var(--dt-h2);
  line-height: 1.15;
  font-weight: 700;
}
a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
a:hover { text-decoration-thickness: 2px; }

/* ---------- hero: text and one action on the left, the console on the right ---------- */
.intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 40px clamp(32px, 5vw, 72px);
  /* top-aligned, so the title sits where it sits on every other page */
  align-items: start;
}
/* eyebrow: the category and the audience, in text only (the navbar carries the mark) */
.kicker {
  margin: 0 0 20px;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--vp-c-text-2);
}
.kicker strong { color: var(--vp-c-text-1); }
.intro h1 {
  font-size: var(--dt-h1);
  line-height: 1.05;
  font-weight: 800;
}
.lede {
  margin: 24px 0 32px;
  max-width: 480px;
  font-size: 19px;
  line-height: 1.55;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
  margin: 0;
}
.actions .dt-next { margin: 0 !important; }
.intro-shot { margin: 0; }
.intro-shot a { display: block; }
/* a card: a thin rule and a soft shadow that stays dark in both themes */
.intro-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--dt-radius-card);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}
:global(.dark .hub .intro-shot img) { box-shadow: 0 8px 24px rgb(0 0 0 / 0.35); }
.intro-shot figcaption {
  margin-top: 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

/* ---------- sections: the same air above each, a heading, then content ---------- */
.stats,
.block {
  margin-top: var(--dt-section-gap);
}
.block > h2,
.copy > h2 { margin-bottom: 32px; }

.stats dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px 40px;
  margin: 0;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
.stats dt {
  font-family: var(--dt-font-display);
  font-size: var(--dt-h2);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.stats dd {
  margin: 8px 0 0;
  max-width: 300px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.asof {
  margin: 20px 0 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.asof a { margin-left: 4px; }

.two {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 32px clamp(28px, 5vw, 72px);
  align-items: start;
}
.pitch {
  margin: 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.6;
}
.pitch a { font-weight: 600; }
.facts {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  max-width: 640px;
}
.facts li {
  position: relative;
  padding: 8px 0 8px 22px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
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
  top: 19px;
  width: 9px;
  height: 2px;
  background: var(--dt-ice);
}
.block .dt-next { margin: 24px 0 0 !important; }
.figure {
  padding: 28px 28px 24px;
  background: var(--dt-card);
  border: 1px solid var(--dt-card-edge);
  border-radius: var(--dt-radius-card);
}

.posts {
  list-style: none;
  margin: 0;
  padding: 0;
}
.posts li {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 4px 24px;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.posts time {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-2);
  padding-top: 3px;
}
.posts li a {
  font-size: var(--dt-h3);
  font-weight: 600;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.posts li a:hover { color: var(--vp-c-brand-1); text-decoration: underline; }
.posts li p {
  grid-column: 2;
  margin: 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.contact .actions { margin-top: 28px; }
.byline {
  margin: 24px 0 0;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}
.byline a { font-weight: 600; }

/* entrance */
@media (prefers-reduced-motion: no-preference) {
  .intro > * {
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .intro .intro-shot { animation-delay: 0.12s; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* ---------- narrower screens ---------- */
@media (max-width: 960px) {
  .intro { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .two { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 767px) {
  .hub { padding-left: 24px; padding-right: 24px; }
  .stats dl { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .stats dd { max-width: none; }
}
@media (max-width: 520px) {
  .posts li { grid-template-columns: minmax(0, 1fr); }
  .posts li p { grid-column: 1; }
  .figure { padding: 20px 16px 16px; }
}
</style>
