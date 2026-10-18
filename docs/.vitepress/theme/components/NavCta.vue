<script setup lang="ts">
// Persistent call to action at the right end of the navbar (and first in the mobile menu).
defineProps<{ screen?: boolean }>();
</script>

<template>
  <a class="nav-cta" :class="{ screen }" href="/ice/design-partners">Design partners</a>
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
  color: var(--dt-paper);
  background: var(--dt-ink);
  border-radius: 3px;
  transition: background-color 0.15s ease;
}
.nav-cta:hover {
  background: var(--vp-c-brand-1);
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
}
</style>
