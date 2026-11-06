<script setup lang="ts">
// Persistent, quiet link to the pilot page at the right end of the navbar (and first in the mobile menu).
defineProps<{ screen?: boolean }>();
</script>

<template>
  <a class="nav-cta" :class="{ screen }" href="/ice/design-partners">Become a design partner</a>
</template>

<style scoped>
.nav-cta {
  display: inline-flex;
  align-items: center;
  height: 36px;
  margin-left: 16px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  background: transparent;
  border: 1.5px solid var(--vp-c-text-1);
  border-radius: var(--dt-radius-control);
  transition: color 0.15s ease, border-color 0.15s ease;
}
/* outlined, so the one solid button on a page is that page's own closing call to action */
.nav-cta:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.nav-cta:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
/* the desktop button only shows where the full nav does */
.nav-cta:not(.screen) {
  display: none;
}
@media (min-width: 768px) {
  .nav-cta:not(.screen) {
    display: inline-flex;
  }
}
.nav-cta.screen {
  display: flex;
  height: 48px;
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--dt-paper);
  background: var(--dt-ink);
  border-color: var(--dt-ink);
}
.nav-cta.screen:hover {
  color: var(--dt-paper);
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
</style>
