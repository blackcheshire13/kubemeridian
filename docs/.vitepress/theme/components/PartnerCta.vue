<script setup lang="ts">
// The site's one call to action, used once per page at most, at the end of it; `address`
// is the bare address row, for pages whose own primary action is something else (a form).
// mailto: alone fails silently in a browser with no mail app (most of desktop Chrome), so a
// click also copies the address and says what to do next; the address, Copy and a web-mail
// link stay visible for readers who never press the button.
import { computed, ref } from 'vue';
import { EMAIL, gmail, mailto } from '../../contact.mjs';

const props = withDefaults(
  defineProps<{
    topic?: 'ice' | 'deusex' | 'general';
    variant?: 'block' | 'plain' | 'address';
    lead?: string;
  }>(),
  { topic: 'ice', variant: 'block' },
);

const LABEL = { ice: 'Become a design partner', deusex: 'Talk to me about deusex', general: 'Write to me' } as const;
const mailHref = computed(() => mailto(props.topic));
const webHref = computed(() => gmail(props.topic));
// idle → after a button click: 'sent' (address copied) or 'nocopy'; after Copy: 'copied' or 'failed'
const state = ref<'idle' | 'sent' | 'nocopy' | 'copied' | 'failed'>('idle');
let reset: ReturnType<typeof setTimeout> | undefined;

function legacyCopy(): boolean {
  const field = document.createElement('textarea');
  field.value = EMAIL;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  field.remove();
  return ok;
}

async function writeAddress(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(EMAIL);
    return true;
  } catch {
    return legacyCopy(); // no Clipboard API (plain http, some webviews) or permission denied
  }
}

function show(next: typeof state.value, ms: number) {
  state.value = next;
  clearTimeout(reset);
  reset = setTimeout(() => (state.value = 'idle'), ms);
}

// Not preventDefault: a reader with a mail app still gets the draft.
async function onMail() {
  show((await writeAddress()) ? 'sent' : 'nocopy', 12000);
}

async function copy() {
  show((await writeAddress()) ? 'copied' : 'failed', 2500);
}
</script>

<template>
  <div class="cta" :class="variant">
    <p v-if="lead" class="lead">{{ lead }}</p>
    <a v-if="variant !== 'address'" class="btn" :href="mailHref" @click="onMail">{{ LABEL[topic] }}</a>
    <p class="mail">
      <span class="addr">{{ EMAIL }}</span>
      <button type="button" class="copy" @click="copy">{{ state === 'copied' ? 'Copied' : 'Copy' }}</button>
      <a class="web" :href="webHref" target="_blank" rel="noopener">Open in Gmail</a>
    </p>
    <p v-if="state === 'sent' || state === 'nocopy'" class="hint" role="status">
      <template v-if="state === 'sent'">Address copied.</template>
      No mail app opened? Paste <span class="addr">{{ EMAIL }}</span> into your mail, or
      <a :href="webHref" target="_blank" rel="noopener">write from Gmail</a>.
    </p>
    <p v-else-if="state === 'failed'" class="hint" role="status">Couldn't copy — select the address instead.</p>
  </div>
</template>

<style scoped>
.cta {
  margin: 0;
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
.btn {
  display: inline-flex;
  align-items: center;
  min-height: 46px;
  padding: 0 20px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none !important;
  border-radius: 3px;
  background: var(--dt-ink);
  color: var(--dt-paper) !important;
  transition: background-color 0.15s ease;
}
.btn:hover {
  background: var(--vp-c-brand-1);
}
.btn:focus-visible,
.copy:focus-visible,
.web:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.mail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
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
.copy:hover {
  border-color: var(--vp-c-text-2);
}
.web {
  font-size: 15px;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.hint {
  max-width: 640px;
  margin: 12px 0 0 !important;
  font-size: 15px;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}
.hint .addr {
  font-size: 14px;
}

@media (max-width: 640px) {
  .btn {
    width: 100%;
  }
  .copy,
  .web {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
