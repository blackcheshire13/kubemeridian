<script setup lang="ts">
// The band above every doc page's title: a product's tabs, a way back from a blog post, or
// an empty band of the same height, so the title sits at the same height on every page.
import { computed } from 'vue';
import { useData } from 'vitepress';

const SECTIONS: Record<string, { text: string; link: string; file: string }[]> = {
  ice: [
    { text: 'Overview', link: '/ice/', file: 'ice/index.md' },
    { text: 'How it works', link: '/ice/how-it-works', file: 'ice/how-it-works.md' },
    { text: 'Free pilot', link: '/ice/design-partners', file: 'ice/design-partners.md' },
  ],
  deusex: [
    { text: 'Overview', link: '/deusex/', file: 'deusex/index.md' },
    { text: 'The method', link: '/deusex/method', file: 'deusex/method.md' },
  ],
};

const { page } = useData();
const section = computed(() => page.value.relativePath.split('/')[0]);
const items = computed(() => SECTIONS[section.value] ?? []);
const isPost = computed(() => section.value === 'blog' && page.value.relativePath !== 'blog/index.md');
</script>

<template>
  <nav v-if="items.length" class="section-nav" :aria-label="`${section} pages`">
    <a
      v-for="item in items"
      :key="item.link"
      :href="item.link"
      :aria-current="item.file === page.relativePath ? 'page' : undefined"
    >{{ item.text }}</a>
  </nav>
  <nav v-else-if="isPost" class="section-nav" aria-label="Blog">
    <a href="/blog/">← All posts</a>
  </nav>
  <div v-else class="section-nav spacer" aria-hidden="true"></div>
</template>

<style scoped>
.section-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.75rem;
  margin-block: 0 1.75rem;
  margin-inline: 0;
  border-block-end: 1px solid var(--dt-rule);
}
/* same height as a row of tabs: 44px links + the 1px rule */
.section-nav.spacer {
  block-size: calc(2.75rem + 1px);
  border-block-end-color: transparent;
}
.section-nav a {
  display: inline-flex;
  align-items: center;
  min-block-size: 2.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--dt-ink-2);
  text-decoration: none;
  border-block-end: 3px solid transparent;
  margin-block-end: -0.0625rem;
}
.section-nav a:hover {
  color: var(--dt-ink);
}
.section-nav a[aria-current='page'] {
  color: var(--dt-ink);
  border-block-end-color: var(--dt-brass);
}
.section-nav a:focus-visible {
  outline: 2px solid var(--dt-link);
  outline-offset: 2px;
}
</style>
