<script setup lang="ts">
// The KubeMeridian archive page (layout: home): the archived notice, a hero and a grid of
// features from the page's front matter, then the page's markdown. Everything on the site's
// one container and gutter.
import { computed } from 'vue';
import { useData } from 'vitepress';
import ArchivedNotice from './ArchivedNotice.vue';

interface Action {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}
interface Feature {
  title: string;
  details: string;
}

const { frontmatter } = useData();
const hero = computed(() => frontmatter.value.hero ?? {});
const actions = computed<Action[]>(() => hero.value.actions ?? []);
const features = computed<Feature[]>(() => frontmatter.value.features ?? []);
const external = (link: string) => /^[a-z]+:\/\//i.test(link);
</script>

<template>
  <div class="km">
    <ArchivedNotice wide />

    <section class="hero dt-wrap">
      <h1>
        <span v-if="hero.name" class="name">{{ hero.name }}</span>
        <span v-if="hero.text" class="text">{{ hero.text }}</span>
      </h1>
      <p v-if="hero.tagline" class="tagline">{{ hero.tagline }}</p>
      <div v-if="actions.length" class="actions">
        <a
          v-for="action in actions"
          :key="action.link"
          class="action"
          :class="action.theme ?? 'brand'"
          :href="action.link"
          :target="external(action.link) ? '_blank' : undefined"
          :rel="external(action.link) ? 'noreferrer' : undefined"
        >{{ action.text }}</a>
      </div>
    </section>

    <section v-if="features.length" class="features dt-wrap" aria-label="Features">
      <ul>
        <li v-for="f in features" :key="f.title">
          <h2>{{ f.title }}</h2>
          <p>{{ f.details }}</p>
        </li>
      </ul>
    </section>

    <div class="content dt-wrap">
      <Content class="dt-prose" />
    </div>
  </div>
</template>

<style scoped>
.km {
  padding-block-end: clamp(6rem, 3rem + 6vw, 8rem);
}

/* ---------- hero ---------- */
.hero {
  padding-block: clamp(3rem, 0.5rem + 8vw, 5rem) clamp(3rem, 1rem + 4vw, 4rem);
}
h1 {
  display: flex;
  flex-direction: column;
}
.name,
.text {
  max-inline-size: 36rem;
  font-family: var(--dt-font-display);
  font-size: clamp(2rem, 0.25rem + 6vw, 3.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.015em;
  white-space: pre-wrap;
}
/* only the product's name keeps the KubeMeridian blue */
.name {
  color: var(--dt-km);
}
.tagline {
  max-inline-size: 36rem;
  padding-block-start: clamp(0.5rem, 0.25rem + 0.6vw, 0.75rem);
  font-size: clamp(1.125rem, 0.75rem + 1.2vw, 1.5rem);
  font-weight: 500;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--dt-ink-2);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-block-start: clamp(1.5rem, 1rem + 1.5vw, 2rem);
}
.action {
  display: inline-flex;
  align-items: center;
  block-size: 2.5rem;
  padding-inline: 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: var(--dt-radius-control);
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
}
.action.brand {
  color: var(--dt-paper);
  background-color: var(--dt-ink);
  border-color: var(--dt-ink);
}
.action.brand:hover {
  background-color: var(--dt-link);
  border-color: var(--dt-link);
}
/* the second action is a text link with an arrow, never a second solid button */
.action.alt {
  padding-inline-start: 0.25rem;
  color: var(--dt-ink);
}
.action.alt::after {
  content: ' →';
  white-space: pre;
}
.action.alt:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.action:focus-visible {
  outline: 2px solid var(--dt-link);
  outline-offset: 3px;
}

/* ---------- features: as many 18rem columns as fit, no breakpoints ---------- */
.features ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.features li {
  padding: 1.5rem;
  background: var(--dt-card);
  border: 1px solid var(--dt-card-edge);
  border-radius: var(--dt-radius-card);
}
.features h2 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
}
.features p {
  padding-block-start: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.7;
  color: var(--dt-ink-2);
}
</style>
