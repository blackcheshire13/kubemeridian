<script setup lang="ts">
// The site's one call to action, in three sizes: a block in the page flow, a card in the
// outline column, and a bare button row. The address is always visible and copyable,
// so the CTA still works for readers without a mail client.
import { computed, ref } from 'vue';
import { EMAIL, mailto } from '../../contact.mjs';

const props = withDefaults(
  defineProps<{
    topic?: 'ice' | 'deusex' | 'general';
    variant?: 'block' | 'aside' | 'buttons' | 'plain';
    lead?: string;
    secondary?: { text: string; href: string };
  }>(),
  { topic: 'ice', variant: 'block' },
);

const label = computed(
  () =>
    ({
      ice: props.variant === 'aside' ? 'Become a design partner' : 'Become an ICE design partner',
      deusex: 'Talk to me about deusex',
      general: 'Write to me',
    })[props.topic],
);
const TITLE = { ice: 'ICE design partners', deusex: 'deusex', general: 'Get in touch' } as const;
const href = computed(() => mailto(props.topic));
const state = ref<'idle' | 'copied' | 'failed'>('idle');
let reset: ReturnType<typeof setTimeout> | undefined;

function legacyCopy(): boolean {
  const field = document.createElement('textarea');
  field.value = EMAIL;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand('copy');
  field.remove();
  return ok;
}

async function copy() {
  let ok = false;
  try {
    await navigator.clipboard.writeText(EMAIL);
    ok = true;
  } catch {
    ok = legacyCopy(); // no Clipboard API (plain http, some webviews) or permission denied
  }
  state.value = ok ? 'copied' : 'failed';
  clearTimeout(reset);
  reset = setTimeout(() => (state.value = 'idle'), 2500);
}
</script>

<template>
  <div class="cta" :class="variant">
    <p v-if="variant === 'aside'" class="title">{{ TITLE[topic] }}</p>
    <p v-if="lead" class="lead">{{ lead }}</p>
    <div class="row">
      <a class="btn" :href="href">{{ label }}</a>
      <a v-if="secondary" class="btn-alt" :href="secondary.href">{{ secondary.text }}</a>
    </div>
    <p v-if="variant !== 'buttons'" class="mail">
      or write to <span class="addr">{{ EMAIL }}</span>
      <button type="button" class="copy" @click="copy">{{ state === 'copied' ? 'Copied' : 'Copy' }}</button>
      <span v-if="state === 'failed'" class="hint" role="status">Couldn't copy — select the address instead</span>
    </p>
  </div>
</template>

<style scoped>
.cta {
  margin: 0;
}
.cta.buttons {
  margin: 22px 0 8px;
}
.cta.block {
  margin: 32px 0;
  padding: 24px 0 0;
  border-top: 2px solid var(--vp-c-text-1);
}
.lead {
  margin: 0 0 16px !important;
  max-width: 640px;
  font-size: 18px;
  line-height: 1.55;
  color: var(--vp-c-text-1);
}
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
}
.btn,
.btn-alt {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 20px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none !important;
  border-radius: 3px;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.btn {
  background: var(--dt-ink);
  color: var(--dt-paper) !important;
}
.btn:hover {
  background: var(--vp-c-brand-1);
}
.btn-alt {
  padding: 0 4px;
  color: var(--vp-c-brand-1) !important;
  text-decoration: underline !important;
  text-underline-offset: 4px;
}
.btn-alt::after {
  content: ' →';
  white-space: pre;
}
.btn:focus-visible,
.btn-alt:focus-visible,
.copy:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.mail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin: 14px 0 0 !important;
  font-size: 15px;
  color: var(--vp-c-text-2);
}
.addr {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  user-select: all;
}
.copy {
  min-height: 32px;
  padding: 0 10px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
  border-radius: 3px;
  background: var(--vp-c-bg);
  cursor: pointer;
}
.hint {
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.copy:hover {
  border-color: var(--vp-c-text-2);
}

/* outline-column card */
.cta.aside {
  margin-top: 28px;
  padding: 16px 0 0;
  border-top: 2px solid var(--vp-c-text-1);
}
.aside .title {
  margin: 0 0 6px;
  font-family: var(--dt-font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.aside .lead {
  font-size: 14px;
  margin-bottom: 12px !important;
}
.aside .btn {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  font-size: 15px;
}
.aside .mail {
  font-size: 13px;
}
.aside .addr {
  font-size: 13px;
}

@media (max-width: 640px) {
  .btn {
    width: 100%;
    justify-content: flex-start;
  }
  .btn-alt {
    padding: 0;
  }
  .btn-alt,
  .copy {
    min-height: 44px;
  }
}
</style>
