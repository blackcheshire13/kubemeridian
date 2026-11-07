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
  margin-block: 1.5rem 0;
  margin-inline: 0;
  padding: 0;
}
.posts li {
  margin: 0;
  padding: 1.375rem 0;
  border-block-start: 1px solid var(--vp-c-divider);
}
.posts li:first-child { border-block-start: 1px solid var(--vp-c-divider); }
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0 !important;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
time { font-family: var(--vp-font-family-mono); }
.posts h2 {
  margin-block: 0.375rem 0 !important;
  margin-inline: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  font-size: 1.375rem;
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
  margin-block: 0.5rem 0 !important;
  margin-inline: 0 !important;
  max-inline-size: 42.5rem;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
