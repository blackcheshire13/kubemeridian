<script setup lang="ts">
import LoopRail from './LoopRail.vue';

const steps = [
  { label: 'Observe', detail: 'A read-only agent and your CI scans report facts out of the cluster.' },
  { label: 'Detect', detail: 'Packs turn facts into findings — only if each says what to do, who does it and why it is sure.' },
  { label: 'Decide', detail: 'A person approves a deterministic, digest-pinned change.', gate: true },
  { label: 'Deliver', detail: 'The operator opens a pull request in your GitOps repository.' },
  { label: 'Verify', detail: 'The case closes only on a measurement newer than the merge.' },
];
</script>

<template>
  <LoopRail
    :steps="steps"
    accent="var(--dt-ice)"
    back="Not measured since the merge? The case stays open and the loop runs again."
  />
</template>
