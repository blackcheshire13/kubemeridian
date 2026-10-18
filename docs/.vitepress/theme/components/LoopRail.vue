<script setup lang="ts">
// A left-aligned loop: steps run down a rail, the last one feeds back into the first.
// Real HTML text (not SVG) so it never scales below a readable size.
defineProps<{
  steps: { label: string; detail?: string; gate?: boolean }[];
  back: string;
  accent?: string;
  compact?: boolean;
}>();
</script>

<template>
  <figure class="rail" :class="{ compact }" :style="accent ? { '--rail-accent': accent } : undefined">
    <ol>
      <li v-for="(s, i) in steps" :key="s.label" :class="{ gate: s.gate }">
        <span class="node" aria-hidden="true">{{ i + 1 }}</span>
        <span class="body">
          <strong>{{ s.label }}</strong>
          <span v-if="s.detail && !compact" class="detail">{{ s.detail }}</span>
        </span>
      </li>
    </ol>
    <figcaption><span class="back" aria-hidden="true">↺</span>{{ back }}</figcaption>
  </figure>
</template>

<style scoped>
.rail {
  --rail-accent: var(--dt-brass);
  position: relative;
  margin: 0;
  padding: 4px 0 0 0;
}
ol {
  list-style: none;
  margin: 0;
  padding: 0 0 0 30px;
  position: relative;
}
/* the rail */
ol::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--rail-accent);
  opacity: 0.55;
}
li {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 18px 0;
  margin: 0;
}
.compact li { padding-bottom: 10px; }
li:last-child { padding-bottom: 0; }
.node {
  position: absolute;
  left: -30px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2px solid var(--rail-accent);
  color: var(--vp-c-text-1);
  font: 600 13px/20px var(--vp-font-family-mono);
  text-align: center;
}
li.gate .node {
  border-style: dashed;
  background: var(--dt-paper-2);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.45;
}
.body strong {
  font-family: var(--dt-font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.detail {
  font-size: 15px;
  color: var(--vp-c-text-2);
}
li.gate strong { color: var(--vp-c-text-2); }
figcaption {
  margin-top: 14px;
  padding-left: 30px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.back {
  display: inline-block;
  margin-right: 8px;
  color: var(--rail-accent);
  font-weight: 700;
}
</style>
