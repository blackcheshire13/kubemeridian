<script setup lang="ts">
// Home of ICE. One container (--dt-container between --dt-gutter, as every other page), one
// vertical rhythm (--dt-section-gap between sections), one type scale (--dt-h1/--dt-h2),
// one primary action. Sections: hero, where ICE stands, how a case closes, who builds ICE,
// news, blog, pilot.
import { data as posts } from '../posts.data';
import NewsList from './NewsList.vue';
import IceLoop from './IceLoop.vue';

const latest = posts.slice(0, 4);
</script>

<template>
  <div class="hub">
    <header class="intro">
      <div class="intro-main">
        <p class="kicker"><strong>ICE</strong> · for teams without a security engineer</p>
        <h1>Kubernetes security fixes as pull requests.</h1>
        <p class="lede">
          ICE turns security findings into pull requests with the fix. You approve and
          merge them; a case closes only after ICE checks the cluster again.
        </p>
        <div class="actions">
          <a class="dt-btn" href="/ice/design-partners">Apply for a free pilot</a>
          <p class="dt-next"><a href="/ice/how-it-works">How ICE works</a></p>
        </div>
      </div>

      <figure class="intro-shot">
        <a href="/ice/#what-it-looks-like">
          <!-- the console in the site's theme; on a phone, the one card that matters instead of a blur -->
          <picture class="dt-light-only">
            <source media="(width <= 40em)" type="image/webp" srcset="/screenshots/ice/action-approval-card.webp" width="816" height="233" />
            <source media="(width <= 40em)" srcset="/screenshots/ice/action-approval-card.png" width="816" height="233" />
            <source type="image/webp" srcset="/screenshots/ice/action-approval.webp" />
            <img
              src="/screenshots/ice/action-approval.png"
              alt="ICE console: a proposed remediation waiting for approval, with Approve and Deny"
              width="1440"
              height="836"
            />
          </picture>
          <picture class="dt-dark-only">
            <source media="(width <= 40em)" type="image/webp" srcset="/screenshots/ice/action-approval-card-dark.webp" width="816" height="233" />
            <source media="(width <= 40em)" srcset="/screenshots/ice/action-approval-card-dark.png" width="816" height="233" />
            <source type="image/webp" srcset="/screenshots/ice/action-approval-dark.webp" />
            <img
              src="/screenshots/ice/action-approval-dark.png"
              alt="ICE console in its dark theme: a proposed remediation waiting for approval, with Approve and Deny"
              width="1440"
              height="836"
            />
          </picture>
        </a>
        <figcaption>The ICE console: a fix waiting for approval. The company and data are fictional.</figcaption>
      </figure>
    </header>

    <section class="stats" aria-label="Where ICE stands">
      <dl>
        <div>
          <dt>16</dt>
          <dd>of 91 capabilities work on a live cluster</dd>
        </div>
        <div>
          <dt>71</dt>
          <dd>more pass tests but have not been seen on a cluster yet</dd>
        </div>
        <div>
          <dt>0</dt>
          <dd>external teams run ICE yet: the pilot is the first step</dd>
        </div>
      </dl>
      <p class="asof">
        As of 13 November 2026, from ICE's capability register.
        <a href="/ice/#status">What live and tested mean</a>
      </p>
    </section>

    <section class="block" aria-labelledby="loop-h">
      <div class="two">
        <div class="copy">
          <h2 id="loop-h">A fix counts only after the cluster is checked again</h2>
          <p class="pitch">
            ICE collects findings from your scanners, runtime sensors and policy tools. For a problem it
            can fix, it prepares the change and shows it to a person. Approving opens a pull request in
            your GitOps repository, and your pipeline applies it. The case stays open until ICE measures
            the cluster again after the merge.
          </p>
          <ul class="facts">
            <li>ICE cannot change your workloads directly: the operator has no write rights outside its own resources</li>
            <li>If a check could not run, ICE shows <em>not measured</em>, never <em>clean</em></li>
            <li>One alert does not trigger a response: three different detectors have to agree</li>
          </ul>
          <p class="dt-next"><a href="/ice/how-it-works">How ICE works</a></p>
        </div>
        <div class="figure"><IceLoop /></div>
      </div>
    </section>

    <section class="block" aria-labelledby="built-h">
      <h2 id="built-h">Who builds ICE</h2>
      <p class="pitch">
        One engineer, <a href="/about">Artur Stepanchenko</a>, with <a href="/deusex/">deusex</a>, an
        autonomous development loop: AI agents on models from four providers write, review and merge
        code on a schedule, and the engineer sets the goal and decides disputed changes. From
        19 October to 5 November, 88% of ICE's merges came from the loop, with a 33-minute median from
        opened to merged. The weak spot: every product decision rests with one person.
      </p>
      <p class="dt-next"><a href="/deusex/">How deusex works</a></p>
    </section>

    <section class="block" aria-labelledby="news-h">
      <h2 id="news-h">News</h2>
      <NewsList compact :limit="4" />
      <p class="dt-next"><a href="/news/">All news</a></p>
    </section>

    <section class="block" aria-labelledby="writing-h">
      <h2 id="writing-h">Blog</h2>
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
      <h2 id="contact-h">Free pilot: eight weeks on your cluster</h2>
      <p class="pitch">
        For teams running Kubernetes in production without a security engineer. Up to five teams run
        ICE on their own cluster before the public release and tell me where it is noisy, missing or
        wrong. The button opens a short form; I reply within two working days.
      </p>
      <p class="actions"><a class="dt-btn" href="/ice/design-partners#apply">Apply for a free pilot</a></p>
      <p class="byline">
        I'm <a href="/about">Artur Stepanchenko</a>. Besides ICE, I take contract work on Kubernetes
        platforms, observability and cost.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* the site's one container between the site's one gutter (styles/base.css); the page is also the
   container its sections query, so they react to the room they have, not to the window */
.hub {
  container: hub / inline-size;
  box-sizing: border-box;
  max-inline-size: calc(var(--dt-container) + 2 * var(--dt-gutter));
  margin-inline: auto;
  padding-inline: var(--dt-gutter);
  padding-block: clamp(2rem, 0.5rem + 5vw, 4.5rem) var(--dt-section-gap);
  color: var(--dt-ink);
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
  color: var(--dt-link);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
a:hover { text-decoration-thickness: 2px; }

/* ---------- hero: text and one action on the left, the console on the right ---------- */
.intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 2.5rem clamp(2rem, 5vw, 4.5rem);
  /* top-aligned, so the title sits where it sits on every other page */
  align-items: start;
}
/* eyebrow: the category and the audience, in text only (the navbar carries the mark) */
.kicker {
  margin-block: 0 1.25rem;
  margin-inline: 0;
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  color: var(--dt-ink-2);
}
.kicker strong { color: var(--dt-ink); }
.intro h1 {
  font-size: var(--dt-h1);
  line-height: 1.05;
  font-weight: 800;
}
.lede {
  margin-block: 1.5rem 2rem;
  margin-inline: 0;
  max-inline-size: 30rem;
  font-size: 1.1875rem;
  line-height: 1.55;
}
/* an inline-size container: the button takes the whole row when the row is narrow (styles/base.css) */
.actions {
  container-type: inline-size;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.75rem;
  margin: 0;
}
.actions .dt-next { margin: 0 !important; }
.intro-shot { margin: 0; }
.intro-shot a { display: block; }
/* a card: a thin rule and a soft shadow that stays dark in both themes */
.intro-shot img {
  display: block;
  inline-size: 100%;
  block-size: auto;
  border: 1px solid var(--dt-rule);
  border-radius: var(--dt-radius-card);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);
}
:global(.dark .hub .intro-shot img) { box-shadow: 0 8px 24px rgb(0 0 0 / 0.35); }
.intro-shot figcaption {
  margin-block-start: 0.625rem;
  font-size: 0.875rem;
  color: var(--dt-ink-2);
}

/* ---------- sections: the same air above each, a heading, then content ---------- */
.stats,
.block {
  margin-block-start: var(--dt-section-gap);
}
.block > h2,
.copy > h2 { margin-block-end: 2rem; }

.stats dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem 2.5rem;
  margin: 0;
  padding-block-start: 1.5rem;
  border-block-start: 1px solid var(--dt-rule);
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
  margin-block: 0.5rem 0;
  margin-inline: 0;
  max-inline-size: 18.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--dt-ink-2);
}
.asof {
  margin-block: 1.25rem 0;
  margin-inline: 0;
  font-size: 0.875rem;
  color: var(--dt-ink-2);
}
.asof a { margin-inline-start: 0.25rem; }

.two {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 2rem clamp(1.75rem, 5vw, 4.5rem);
  align-items: start;
}
.pitch {
  margin: 0;
  max-inline-size: 40rem;
  font-size: 1.0625rem;
  line-height: 1.6;
}
.pitch a { font-weight: 600; }
.facts {
  margin-block: 1.5rem 0;
  margin-inline: 0;
  padding: 0;
  list-style: none;
  max-inline-size: 40rem;
}
.facts li {
  position: relative;
  padding-block: 0.5rem;
  padding-inline: 1.375rem 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--dt-ink-2);
  border-block-start: 1px solid var(--dt-rule);
}
.facts code {
  font-family: var(--dt-font-mono);
  font-size: 0.9375rem;
  color: var(--dt-ink);
}
.facts li::before {
  content: '';
  position: absolute;
  inset-inline-start: 0.125rem;
  inset-block-start: 1.1875rem;
  inline-size: 0.5625rem;
  block-size: 0.125rem;
  background: var(--dt-ice);
}
.block .dt-next { margin-block: 1.5rem 0 !important; margin-inline: 0 !important; }
.figure {
  padding-block: clamp(1.25rem, 0.5rem + 2.5vw, 1.75rem) clamp(1rem, 0.5rem + 2vw, 1.5rem);
  padding-inline: clamp(1rem, 4vw, 1.75rem);
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
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 0.25rem 1.5rem;
  padding: 1rem 0;
  border-block-start: 1px solid var(--dt-rule);
}
.posts time {
  font-family: var(--dt-font-mono);
  font-size: 0.875rem;
  color: var(--dt-ink-2);
  padding-block-start: 0.1875rem;
}
.posts li a {
  font-size: var(--dt-h3);
  font-weight: 600;
  line-height: 1.35;
  color: var(--dt-ink);
  text-decoration: none;
}
.posts li a:hover { color: var(--dt-link); text-decoration: underline; }
.posts li p {
  grid-column: 2;
  margin: 0;
  max-inline-size: 40rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--dt-ink-2);
}

.contact .actions { margin-block-start: 1.75rem; }
.byline {
  margin-block: 1.5rem 0;
  margin-inline: 0;
  max-inline-size: 40rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--dt-ink-2);
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
  from { opacity: 0; transform: translateY(0.875rem); }
  to { opacity: 1; transform: none; }
}

/* ---------- less room: the page (container "hub") decides, not the window ---------- */
/* the hero and "how a case closes" stack below 56rem of page (960px at the default font) */
@container hub (inline-size <= 56rem) {
  .intro,
  .two { grid-template-columns: minmax(0, 1fr); }
}
/* the three facts stack below 44rem of page (768px at the default font) */
@container hub (inline-size < 44rem) {
  .stats dl { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .stats dd { max-inline-size: none; }
}
/* posts: the date goes above the title below 29.5rem of page (a phone) */
@container hub (inline-size < 29.5rem) {
  .posts li { grid-template-columns: minmax(0, 1fr); }
  .posts li p { grid-column: 1; }
}
</style>
