<script setup lang="ts">
// Navbar actions at the right end of the bar (and first in the mobile menu): a link to the
// demo console and a persistent link to the pilot page.
// The demo is a static build of the ICE console on made-up data (acme-corp), so it opens in a
// new tab and the visitor keeps their place on the site.
defineProps<{ screen?: boolean }>();

const DEMO_URL = 'https://demo.devopstech.net/';
</script>

<template>
  <!-- the menu puts the pilot first; the bar reads left to right to the button -->
  <div v-if="screen" class="screen-actions">
    <a class="nav-cta" href="/ice/design-partners">Apply for a free pilot</a>
    <a class="nav-demo dt-ext" :href="DEMO_URL" target="_blank" rel="noopener">Demo console</a>
  </div>
  <div v-else class="bar-actions">
    <a class="nav-demo dt-ext" :href="DEMO_URL" target="_blank" rel="noopener">Demo console</a>
    <a class="nav-cta" href="/ice/design-partners">Apply for a free pilot</a>
  </div>
</template>

<style scoped>
/* rem: sizes follow the reader's font setting. Logical properties: no left/right/width/height. */
.nav-cta,
.nav-demo {
  display: inline-flex;
  align-items: center;
  block-size: 2.25rem;
  padding-inline: 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--dt-ink);
  border: 1.5px solid transparent;
  border-radius: var(--dt-radius-control);
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}
/* outlined, so the one solid button on a page is that page's own closing call to action */
.nav-cta {
  border-color: currentColor;
}
.nav-cta:hover,
.nav-demo:hover {
  color: var(--dt-link);
}
.nav-cta:focus-visible,
.nav-demo:focus-visible {
  outline: 2px solid var(--dt-link);
  outline-offset: 3px;
}

/* navbar: the demo is a plain link, the pilot the one bordered action. The bar's actions
   appear with the full nav (SiteNav.vue, 48em: it follows the reader's font setting). */
.bar-actions {
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-inline-start: 1rem;
}
@media (width >= 48em) {
  .bar-actions {
    display: flex;
  }
}

/* mobile menu: intrinsic grid, no breakpoints. A button needs 15rem; where two fit side by
   side (small tablets, foldables) they share the row, on a phone each takes the full row. */
.screen-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: 0.75rem;
  margin-block-end: 1rem;
}
.screen-actions a {
  block-size: 3rem;
  padding-inline: 1rem;
  font-size: 1rem;
  border-color: currentColor;
}
.screen-actions .nav-cta {
  color: var(--dt-paper);
  background: var(--dt-ink);
  border-color: var(--dt-ink);
}
.screen-actions .nav-cta:hover {
  color: var(--dt-paper);
  background: var(--dt-link);
  border-color: var(--dt-link);
}
</style>
