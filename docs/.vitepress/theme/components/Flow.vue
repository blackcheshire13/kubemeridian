<script setup lang="ts">
// Left-to-right flow of labelled stages that wraps on narrow screens.
// `who` marks the actor that moves the item into this stage; `machine` names the system.
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    steps: { label: string; note?: string; who?: 'human' | 'machine' | 'measure' }[];
    exits?: string[];
    accent?: string;
    machine?: string;
  }>(),
  { machine: 'ICE' },
);
const whoLabel = computed(() => ({ human: 'person', machine: props.machine, measure: 'measurement' }));
</script>

<template>
  <figure class="flow" :style="accent ? { '--flow-accent': accent } : undefined">
    <ol>
      <li v-for="s in steps" :key="s.label" :class="s.who">
        <strong>{{ s.label }}</strong>
        <span class="who">{{ s.who ? whoLabel[s.who] : '' }}</span>
        <span v-if="s.note" class="note">{{ s.note }}</span>
      </li>
    </ol>
    <figcaption v-if="exits?.length">
      <span v-for="e in exits" :key="e" class="exit">{{ e }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.flow {
  --flow-accent: var(--dt-brass);
  margin-block: 1.5rem 1.75rem;
  margin-inline: 0;
  container-type: inline-size;
}
ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-inline-size: 8rem;
  max-inline-size: 13.75rem;
  flex: 1 1 8rem;
  margin: 0 !important;
  padding-block: 0.625rem 0.75rem;
  padding-inline: 0.75rem 1.625rem;
  border-block-start: 3px solid var(--flow-accent);
  background: var(--dt-paper-2);
}
li:not(:last-child)::after {
  content: '→';
  position: absolute;
  inset-inline-end: 0.375rem;
  inset-block-start: 0.5625rem;
  font-size: 0.9375rem;
  color: var(--vp-c-text-2);
}
li.human { border-block-start-style: dashed; }
li.measure { border-block-start-color: var(--vp-c-text-1); }
strong {
  font-family: var(--vp-font-family-base);
  font-size: 1rem;
  line-height: 1.3;
}
.who:empty { display: none; }
.who {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
}
.note {
  margin-block-start: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}
/* too narrow for one row: stages become a timeline (stage · who · note) instead of breaking 5 + 2 */
@container (inline-size <= 56.25rem) {
  ol { flex-direction: column; gap: 0; border-inline-start: 3px solid var(--flow-accent); }
  li {
    display: grid;
    grid-template-columns: minmax(6rem, 8.75rem) minmax(5.5rem, 7.25rem) minmax(0, 1fr);
    align-items: baseline;
    gap: 0.125rem 1rem;
    max-inline-size: none;
    flex: none;
    padding: 0.5625rem 0.75rem;
    border-block-start: 0;
    background: none;
  }
  li + li,
  li.human + li,
  li + li.human,
  li + li.measure { border-block-start: 1px solid var(--vp-c-divider); }
  li:not(:last-child)::after { content: none; }
  .note { margin-block-start: 0; }
  /* keep the three columns even when a stage has no actor */
  .who:empty { display: block; }
}
@container (inline-size <= 30rem) {
  li { grid-template-columns: minmax(0, 1fr) auto; }
  .note { grid-column: 1 / -1; }
}
figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.125rem;
  margin-block-start: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
.exit::before {
  content: '↳ ';
  color: var(--flow-accent);
  font-weight: 700;
}
</style>
