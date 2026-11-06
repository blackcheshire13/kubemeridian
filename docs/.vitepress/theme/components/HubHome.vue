<script setup lang="ts">
// Home of ICE: the first screen says what it is, for whom, shows the console and offers one
// action; then where ICE stands, how a case closes, how ICE is built, news and writing.
import { data as posts } from '../posts.data';
import NewsList from './NewsList.vue';
import { NEWS, newsId } from '../../news.mjs';
import IceLoop from './IceLoop.vue';

const latest = posts.slice(0, 4);
const lastNews = NEWS.find((n) => n.status !== 'planned');
</script>

<template>
  <div class="hub">
    <header class="intro">
      <div class="intro-main">
        <p class="kicker">
          <img class="kern" src="/ice-mark.svg" alt="" width="10" height="20" />
          <img class="kern dark-only" src="/ice-mark-dark.svg" alt="" width="10" height="20" />
          <span><strong>ICE</strong> · Kubernetes security for teams without a security team</span>
        </p>
        <h1>Security fixes that <span class="turn">prove they worked.</span></h1>
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
          <img
            src="/screenshots/ice/action-approval.png"
            alt="ICE console: approving a change shows the rendered manifest and what merging it does"
            width="1440"
            height="900"
          />
        </a>
        <figcaption>The ICE console approving a change. Synthetic demo data.</figcaption>
      </figure>
    </header>

    <aside class="now" aria-label="Where ICE stands">
      <ul>
        <li>
          <span class="dt-s live" aria-hidden="true"></span>
          <span><strong>13 capabilities live</strong> on a real cluster, 66 tested · <a href="/ice/#honest-status">what that means</a></span>
        </li>
        <li>
          <span class="dt-s live" aria-hidden="true"></span>
          <span><strong>88% of merges</strong> come from an autonomous loop · <a href="/deusex/">deusex</a></span>
        </li>
        <li v-if="lastNews">
          <span class="dt-s" aria-hidden="true"></span>
          <span><strong>Latest:</strong> <a :href="`/news/#${newsId(lastNews)}`">{{ lastNews.title }}</a></span>
        </li>
      </ul>
      <p class="asof">As of 6 November 2026 · loop figures for 19 October – 5 November</p>
    </aside>

    <section class="projects" aria-label="How ICE works">
      <article class="project ice">
        <div class="copy">
          <h2>A case closes on proof, not on merge</h2>
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
          <p class="go"><a href="/ice/how-it-works">How it works</a><a href="/ice/">ICE overview</a></p>
        </div>
        <div class="figure"><IceLoop /></div>
      </article>


      <article class="built">
        <p class="meta"><span class="dot" aria-hidden="true"></span>How ICE is built</p>
        <h2><a href="/deusex/">deusex</a></h2>
        <p class="pitch">
          ICE is developed by deusex, an autonomous loop: agents plan, build, review and merge on a
          schedule, and a person decides the concept. From 19 October to 5 November, 88% of ICE's
          merges came from the loop, with a 33-minute median from opened to merged.
        </p>
        <p class="go"><a href="/deusex/">How deusex works</a><a href="/deusex/method">The method</a></p>
      </article>
    </section>

    <section class="writing" aria-labelledby="news-h">
      <h2 id="news-h">News</h2>
      <div>
        <NewsList compact :limit="4" />
        <p class="more"><a href="/news/">All news</a></p>
      </div>
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
      <h2 id="contact-h">Pilot ICE</h2>
      <div>
        <p class="contact-lead">
          Running Kubernetes in production without a security team? Run the loop on your cluster
          before the public release, and tell me where it is noisy, missing or wrong.
        </p>
        <a class="dt-btn" href="/ice/design-partners#apply">Become a design partner</a>
        <p class="about-link">
          ICE is built by <a href="/about">Artur Stepanchenko</a>, who also takes contract work on
          Kubernetes platforms, observability and cost.
        </p>
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

/* intro: what ICE is and one action on the left, the console on the right; status strip below */
.intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 40px clamp(32px, 5vw, 72px);
  align-items: center;
}
.kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.kicker strong { color: var(--vp-c-text-1); }
.kern { flex: none; width: 10px; height: 20px; }
.kern.dark-only { display: none; }
/* :global() must wrap the whole selector: `:global(.dark) .x` compiles to a bare `.dark` rule */
:global(.dark .hub .kern) { display: none; }
:global(.dark .hub .kern.dark-only) { display: block; }
.intro h1 {
  font-size: clamp(38px, 5.4vw, 66px);
  line-height: 1;
  font-weight: 800;
  text-wrap: balance;
}
.turn {
  background-image: linear-gradient(transparent 70%, color-mix(in oklch, var(--dt-brass) 45%, transparent) 70%);
  padding: 0 0.04em;
}
:global(.dark .hub .turn) {
  /* on dark paper a wide marker turns muddy: a thin brass rule instead */
  background-image: linear-gradient(transparent 88%, var(--dt-brass) 88%, var(--dt-brass) 94%, transparent 94%);
}
.lede {
  margin: 24px 0 28px;
  max-width: 480px;
  font-size: clamp(18px, 1.6vw, 20px);
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
.lede a { font-weight: 600; }
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
}
.actions .dt-next { margin: 0 !important; }
.intro-shot {
  margin: 0;
}
.intro-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--dt-radius-card);
  box-shadow: 0 18px 40px -24px color-mix(in oklch, var(--dt-ink) 45%, transparent);
}
.intro-shot figcaption {
  margin-top: 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.now {
  margin-top: clamp(40px, 6vw, 64px);
  padding-top: 16px;
  border-top: 2px solid var(--vp-c-text-1);
}
.now ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 32px;
}
.now li {
  display: flex;
  gap: 10px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.now li strong { color: var(--vp-c-text-1); }
.now li .dt-s { padding-top: 1px; }
.now li .dt-s::before { margin-right: 0; }
.asof {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

/* projects */
.projects {
  margin-top: clamp(48px, 7vw, 88px);
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
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
}
.ice { --accent: var(--dt-ice); }
.built { --accent: var(--dt-deusex); }
.project h2 {
  font-size: clamp(28px, 3.4vw, 40px);
  line-height: 1.1;
  font-weight: 800;
  text-wrap: balance;
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
.built {
  padding: clamp(28px, 4vw, 48px) 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.built h2 {
  font-size: clamp(28px, 3.4vw, 40px);
  line-height: 1.1;
  font-weight: 800;
}
.built h2 a { color: var(--vp-c-text-1); text-decoration: none; }
.built h2 a:hover { color: var(--vp-c-brand-1); }
.figure {
  align-self: start;
  padding: 28px 28px 24px;
  background: var(--dt-paper-2);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--dt-radius-card);
}


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
  font-family: var(--vp-font-family-base);
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
.contact-lead {
  margin: 0 0 20px;
  max-width: 640px;
  font-size: 18px;
  line-height: 1.55;
}
.about-link {
  margin: 20px 0 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}
.about-link a { font-weight: 600; }

/* entrance */
@media (prefers-reduced-motion: no-preference) {
  .intro > *,
  .project {
    animation: rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .intro .intro-shot { animation-delay: 0.12s; }
  .project.ice { animation-delay: 0.2s; }
}
@keyframes rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* narrow screens */
@media (max-width: 960px) {
  .intro { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .now ul { grid-template-columns: minmax(0, 1fr); }
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
