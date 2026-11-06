<script setup lang="ts">
// The band above every doc page's title: a product's tabs, a way back from a blog post, or
// an empty band of the same height, so the title sits at the same height on every page.
import { computed } from 'vue';
import { useData } from 'vitepress';

const SECTIONS: Record<string, { text: string; link: string; file: string }[]> = {
  ice: [
    { text: 'Overview', link: '/ice/', file: 'ice/index.md' },
    { text: 'How it works', link: '/ice/how-it-works', file: 'ice/how-it-works.md' },
    { text: 'Design partners', link: '/ice/design-partners', file: 'ice/design-partners.md' },
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
  gap: 0 28px;
  margin: 0 0 28px;
  border-bottom: 1px solid var(--vp-c-divider);
}
/* same height as a row of tabs: 44px links + the 1px rule */
.section-nav.spacer {
  height: 45px;
  border-bottom-color: transparent;
}
.section-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}
.section-nav a:hover {
  color: var(--vp-c-text-1);
}
.section-nav a[aria-current='page'] {
  color: var(--vp-c-text-1);
  border-bottom-color: var(--dt-brass);
}
.section-nav a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
</style>
