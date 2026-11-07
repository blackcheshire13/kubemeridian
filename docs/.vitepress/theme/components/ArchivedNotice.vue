<script setup lang="ts">
// Shown on the /kubemeridian archive page (see theme/index.ts).
import { KM_LAST_RELEASE, KM_RELEASE_URL } from '../../kubemeridian.mjs';

defineProps<{ wide?: boolean }>();
</script>

<template>
  <aside class="archived" :class="{ wide }" aria-label="Project status">
    <p class="label"><span class="mark" aria-hidden="true"></span>Archived · October 2026</p>
    <p>
      Grafana Labs declined to list KubeMeridian in its official plugin catalog because it
      overlaps with Grafana Cloud Kubernetes Monitoring. Without a catalog listing it can't get a
      community signature, so it is distributed unsigned, and development has stopped. The last release,
      <a :href="KM_RELEASE_URL">{{ KM_LAST_RELEASE }}</a>, remains available as an
      <a href="#install">unsigned plugin</a>.
    </p>
  </aside>
</template>

<style scoped>
.archived {
  margin-block: 0 2rem;
  margin-inline: 0;
  padding-block: 1rem 1.125rem;
  padding-inline: 1.25rem;
  background: var(--dt-paper-3);
  border-block-start: 2px solid var(--vp-c-text-2);
  color: var(--vp-c-text-1);
}
/* above the home hero: the site's container between the site's gutter, like the hero */
.archived.wide {
  inline-size: min(var(--dt-container), 100% - 2 * var(--dt-gutter));
  margin-block: 1.5rem 0;
  margin-inline: auto;
}
.label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-block: 0 0.375rem;
  margin-inline: 0;
  font-size: 1rem;
  font-weight: 600;
}
.mark {
  inline-size: 0.5625rem;
  block-size: 0.5625rem;
  border-radius: 50%;
  background: var(--vp-c-text-2);
}
.archived p:last-child {
  margin: 0;
  max-inline-size: 47.5rem;
  font-size: 0.9375rem;
  line-height: 1.6;
}
.archived a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
