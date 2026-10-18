<script setup lang="ts">
// Shown on /kubemeridian and every /guide/* page (see theme/index.ts).
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
      <a href="/guide/install">unsigned plugin</a>.
    </p>
  </aside>
</template>

<style scoped>
.archived {
  margin: 0 0 32px;
  padding: 16px 20px 18px;
  background: var(--dt-paper-3);
  border-top: 2px solid var(--vp-c-text-2);
  color: var(--vp-c-text-1);
}
.archived.wide {
  max-width: 1152px;
  margin: 24px auto 0;
}
.label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 6px;
  font-family: var(--dt-font-display);
  font-size: 16px;
  font-weight: 700;
}
.mark {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--vp-c-text-2);
}
.archived p:last-child {
  margin: 0;
  max-width: 760px;
  font-size: 15px;
  line-height: 1.6;
}
.archived a {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}
@media (max-width: 1200px) {
  .archived.wide { margin-left: 24px; margin-right: 24px; }
}
@media (max-width: 640px) {
  .archived.wide { margin-left: 16px; margin-right: 16px; }
}
</style>
