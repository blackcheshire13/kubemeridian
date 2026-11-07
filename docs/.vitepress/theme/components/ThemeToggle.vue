<script setup lang="ts">
// Light/dark switch. VitePress's runtime owns the state (useData().isDark): it reads the saved
// choice before the first paint (no flash) and stores a change in localStorage.
import { computed } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();
const title = computed(() => (isDark.value ? 'Switch to light theme' : 'Switch to dark theme'));
</script>

<template>
  <button
    type="button"
    class="switch"
    role="switch"
    :title="title"
    :aria-checked="isDark"
    @click="isDark = !isDark"
  >
    <span class="visually-hidden">Dark theme</span>
    <span class="knob" aria-hidden="true">
      <svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" /><path d="M12 1.5v2.5M12 20v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M1.5 12H4M20 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" /></svg>
      <svg class="moon" viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" /></svg>
    </span>
  </button>
</template>

<style scoped>
/* a 40×22 track (at the default font) with an 18px knob that slides to the right in dark */
.switch {
  position: relative;
  flex: none;
  inline-size: 2.5rem;
  block-size: 1.375rem;
  border: 1px solid var(--dt-border);
  border-radius: 1rem;
  background-color: rgb(142 150 170 / 0.14);
  transition: border-color 0.25s;
}
.switch:hover {
  border-color: var(--dt-ink-3);
}
.switch:focus-visible {
  outline: 2px solid var(--dt-link);
  outline-offset: 2px;
}
.knob {
  position: absolute;
  inset-block-start: 1px;
  inset-inline-start: 1px;
  display: grid;
  place-items: center;
  inline-size: calc(1.375rem - 4px);
  block-size: calc(1.375rem - 4px);
  border-radius: 50%;
  background-color: #fff;
  box-shadow: var(--dt-shadow-1);
  transition: transform 0.25s;
}
.dark .knob {
  background-color: #000;
  transform: translateX(calc(2.5rem - 1.375rem));
}
svg {
  grid-area: 1 / 1;
  inline-size: 0.75rem;
  block-size: 0.75rem;
  fill: none;
  stroke: var(--dt-ink-2);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.moon {
  fill: currentColor;
  stroke: none;
  color: var(--dt-ink);
  opacity: 0;
}
.dark .sun {
  opacity: 0;
}
.dark .moon {
  opacity: 1;
}
</style>
