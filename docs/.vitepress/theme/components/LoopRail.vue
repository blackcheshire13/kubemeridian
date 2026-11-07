<script setup lang="ts">
// A left-aligned loop: steps run down a rail, the last one feeds back into the first.
// Real HTML text (not SVG) so it never scales below a readable size.
defineProps<{
  steps: { label: string; detail?: string; gate?: boolean }[];
  back: string;
  accent?: string;
}>();
</script>

<template>
  <figure class="rail" :style="accent ? { '--rail-accent': accent } : undefined">
    <ol>
      <li v-for="(s, i) in steps" :key="s.label" :class="{ gate: s.gate }">
        <span class="node" aria-hidden="true">{{ i + 1 }}</span>
        <span class="body">
          <strong>{{ s.label }}</strong>
          <span v-if="s.detail" class="detail">{{ s.detail }}</span>
        </span>
      </li>
    </ol>
    <figcaption><span class="back" aria-hidden="true">↺</span>{{ back }}</figcaption>
    <p v-if="steps.some((s) => s.gate)" class="legend">
      <svg class="mini" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="var(--rail-accent)" stroke-width="2" stroke-dasharray="3 2.2" />
      </svg>
      A dashed step is decided by a person.
    </p>
  </figure>
</template>

<style scoped>
.rail {
  --rail-accent: var(--dt-brass);
  position: relative;
  margin: 0;
  padding-block: 0.25rem 0;
  padding-inline: 0;
}
ol {
  list-style: none;
  margin: 0;
  padding-block: 0;
  padding-inline: 1.875rem 0;
  position: relative;
}
/* the rail */
ol::before {
  content: '';
  position: absolute;
  inset-inline-start: 0.6875rem;
  inset-block-start: 0.75rem;
  inset-block-end: 0.75rem;
  inline-size: 0.125rem;
  background: var(--rail-accent);
  opacity: 0.55;
}
li {
  position: relative;
  display: flex;
  gap: 0.75rem;
  padding-block: 0 1.125rem;
  padding-inline: 0;
  margin: 0;
}
li:last-child { padding-block-end: 0; }
.node {
  position: absolute;
  inset-inline-start: -1.875rem;
  inset-block-start: 0;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border-radius: 50%;
  background: var(--dt-paper);
  border: 2px solid var(--rail-accent);
  color: var(--dt-ink);
  font: 600 0.8125rem/1.25rem var(--dt-font-mono);
  text-align: center;
}
li.gate .node {
  border-style: dashed;
  background: var(--dt-paper-2);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  line-height: 1.45;
}
.body strong {
  font-family: var(--dt-font-text);
  font-size: 1rem;
  font-weight: 700;
  color: var(--dt-ink);
}
.detail {
  font-size: 0.9375rem;
  color: var(--dt-ink-2);
}
li.gate strong { color: var(--dt-ink-2); }
.legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block: 0.625rem 0;
  margin-inline: 0;
  padding-inline-start: 1.875rem;
  font-size: 0.875rem;
  color: var(--dt-ink-2);
}
.legend .mini {
  flex: none;
  inline-size: 1rem;
  block-size: 1rem;
}
figcaption {
  margin-block-start: 0.875rem;
  padding-inline-start: 1.875rem;
  font-size: 0.875rem;
  color: var(--dt-ink-2);
}
.back {
  display: inline-block;
  margin-inline-end: 0.5rem;
  color: var(--rail-accent);
  font-weight: 700;
}
</style>
