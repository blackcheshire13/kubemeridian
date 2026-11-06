<script setup lang="ts">
// Dated updates from news.mjs: in full on /news/, as a compact list of links on the home page.
import { computed } from 'vue';
import { NEWS, newsId } from '../../news.mjs';

const props = withDefaults(defineProps<{ planned?: boolean; limit?: number; compact?: boolean }>(), {
  planned: false,
  compact: false,
});

const items = computed(() =>
  NEWS.filter((n) => (n.status === 'planned') === props.planned)
    .slice(0, props.limit ?? NEWS.length)
    .map((n) => ({ ...n, id: newsId(n) })),
);

const fmt = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
</script>

<template>
  <ol class="news" :class="{ compact }">
    <li v-for="n in items" :id="compact ? undefined : n.id" :key="n.id">
      <p class="meta">
        <time :datetime="n.date">{{ fmt(n.date) }}</time>
        <span class="prod" :class="n.product">{{ n.product === 'ice' ? 'ICE' : 'deusex' }}</span>
        <span v-if="n.status" class="dt-s" :class="n.status">{{ n.status }}</span>
      </p>
      <a v-if="compact" class="title" :href="`/news/#${n.id}`">{{ n.title }}</a>
      <template v-else>
        <h2 class="title">{{ n.title }}</h2>
        <p class="body" v-html="n.body"></p>
      </template>
    </li>
  </ol>
</template>

<style scoped>
.news {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
}
.news li {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 20px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.news li:first-child {
  border-top: 2px solid var(--vp-c-text-1);
}
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  margin: 0 !important;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.prod {
  font-weight: 600;
}
.prod.ice {
  color: var(--dt-ice);
}
.prod.deusex {
  color: var(--dt-deusex, var(--vp-c-text-1));
}
.title {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-family: var(--dt-font-display);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
.body {
  margin: 4px 0 0 !important;
  max-width: 68ch;
  line-height: 1.65;
}
.compact li {
  padding: 14px 0;
}
.compact .title {
  font-size: 18px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.compact .title:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
