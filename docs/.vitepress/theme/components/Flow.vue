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
  margin: 24px 0 28px;
  container-type: inline-size;
}
ol {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 0;
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 128px;
  max-width: 220px;
  flex: 1 1 128px;
  margin: 0 !important;
  padding: 10px 26px 12px 12px;
  border-top: 3px solid var(--flow-accent);
  background: var(--dt-paper-2);
}
li:not(:last-child)::after {
  content: '→';
  position: absolute;
  right: 6px;
  top: 9px;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
li.human { border-top-style: dashed; }
li.measure { border-top-color: var(--vp-c-text-1); }
strong {
  font-family: var(--dt-font-display);
  font-size: 16px;
  line-height: 1.3;
}
.who:empty { display: none; }
.who {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-2);
}
.note {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}
/* too narrow for one row: stages become a timeline (stage · who · note) instead of breaking 5 + 2 */
@container (max-width: 900px) {
  ol { flex-direction: column; gap: 0; border-left: 3px solid var(--flow-accent); }
  li {
    display: grid;
    grid-template-columns: minmax(96px, 140px) minmax(88px, 116px) minmax(0, 1fr);
    align-items: baseline;
    gap: 2px 16px;
    max-width: none;
    flex: none;
    padding: 9px 12px;
    border-top: 0;
    background: none;
  }
  li + li,
  li.human + li,
  li + li.human,
  li + li.measure { border-top: 1px solid var(--vp-c-divider); }
  li:not(:last-child)::after { content: none; }
  .note { margin-top: 0; }
  /* keep the three columns even when a stage has no actor */
  .who:empty { display: block; }
}
@container (max-width: 480px) {
  li { grid-template-columns: minmax(0, 1fr) auto; }
  .note { grid-column: 1 / -1; }
}
figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.exit::before {
  content: '↳ ';
  color: var(--flow-accent);
  font-weight: 700;
}
</style>
