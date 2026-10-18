<script setup lang="ts">
import { data as posts } from '../posts.data';
</script>

<template>
  <ol class="posts">
    <li v-for="p in posts" :key="p.url">
      <p class="meta">
        <time :datetime="p.date">{{ p.date }}</time>
        <span v-if="p.tags.length" class="tags">{{ p.tags.join(' · ') }}</span>
      </p>
      <h2><a :href="p.url">{{ p.title }}</a></h2>
      <p class="desc">{{ p.description }}</p>
    </li>
  </ol>
</template>

<style scoped>
.posts {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
}
.posts li {
  margin: 0;
  padding: 22px 0;
  border-top: 1px solid var(--vp-c-divider);
}
.posts li:first-child { border-top: 2px solid var(--vp-c-text-1); }
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0 !important;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
time { font-family: var(--vp-font-family-mono); }
.posts h2 {
  margin: 6px 0 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 22px;
  line-height: 1.3;
}
.posts h2 a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}
.posts h2 a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}
.desc {
  margin: 8px 0 0 !important;
  max-width: 680px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
