<script setup lang="ts">
import LoopRail from './LoopRail.vue';

defineProps<{ compact?: boolean }>();

const steps = [
  { label: 'Plan', detail: 'The owner reads the board and prints one move. It has no write tools; a script carries the move out.' },
  { label: 'Build', detail: 'Five lines on models from four providers each take one item and open a pull request.' },
  { label: 'Judge', detail: 'A critic reads the diff. Merging needs its approval, green CI and the exact commit it reviewed.' },
  { label: 'Merge policy', detail: 'Written in code, not in a prompt: zero checks means “still running”, never “passed”.' },
  { label: 'Concept', detail: 'Changes to the method itself, or anything the critic is unsure of, wait for a person.', gate: true },
  { label: 'Check what is live', detail: 'A watcher tries the capability on the running system; an empty queue triggers a search for the next gap.' },
];
</script>

<template>
  <LoopRail
    :steps="steps"
    :compact="compact"
    accent="var(--dt-deusex)"
    back="Every ten minutes ready work is handed out; every two hours the owner re-plans from what actually landed."
  />
</template>
