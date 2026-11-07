<script setup lang="ts">
// "ICE · devopstech" in the navbar: the product first, the workshop that makes it second.
</script>

<template>
  <span class="brand-suffix" aria-hidden="true">devopstech</span>
</template>

<style scoped>
.brand-suffix {
  display: inline-flex;
  align-items: center;
  margin-inline-start: 0.625rem;
  padding-inline-start: 0.625rem;
  block-size: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dt-ink-2);
  border-inline-start: 1px solid var(--dt-rule);
  white-space: nowrap;
}
/* from the nav switch (48em = 768px at the default font, SiteNav.vue) to 60em (960px) the full
   nav and the actions need the room the suffix would take; in em it follows the font setting */
@media (48em <= width < 60em) {
  .brand-suffix {
    display: none;
  }
}
</style>
