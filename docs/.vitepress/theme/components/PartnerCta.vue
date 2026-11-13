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

const LABEL = { ice: 'Write about a pilot', deusex: 'Talk to me about deusex', general: 'Write to me' } as const;
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
    <a v-if="variant !== 'address'" class="dt-btn" :href="mailHref" @click="onMail">{{ LABEL[topic] }}</a>
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
/* an inline-size container: the button takes the whole row when the row is narrow (styles/site.css) */
.cta {
  container-type: inline-size;
  margin: 0;
}
.cta.block {
  margin: 2rem 0;
  padding-block: 1.5rem 0;
  padding-inline: 0;
  border-block-start: 1px solid var(--dt-rule);
}
.lead {
  margin-block: 0 1rem !important;
  margin-inline: 0 !important;
  max-inline-size: 40rem;
  font-size: 1.125rem;
  line-height: 1.55;
  color: var(--dt-ink);
}
.copy:focus-visible,
.web:focus-visible {
  outline: 2px solid var(--dt-link);
  outline-offset: 3px;
}
.mail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.875rem;
  margin-block: 0.875rem 0 !important;
  margin-inline: 0 !important;
  font-size: 0.9375rem;
  color: var(--dt-ink-2);
}
.addr {
  font-family: var(--dt-font-mono);
  color: var(--dt-ink);
  user-select: all;
}
.copy {
  min-block-size: 2rem;
  padding: 0 0.625rem;
  font-size: 0.875rem;
  color: var(--dt-ink);
  border: 1px solid var(--dt-border);
  border-radius: var(--dt-radius-control);
  background: var(--dt-paper);
  cursor: pointer;
}
.copy:hover {
  border-color: var(--dt-ink-2);
}
.web {
  font-size: 0.9375rem;
  color: var(--dt-link);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.hint {
  max-inline-size: 40rem;
  margin-block: 0.75rem 0 !important;
  margin-inline: 0 !important;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--dt-ink);
}
.hint .addr {
  font-size: 0.875rem;
}

/* touch screens: 44px tap targets (an input feature, not a width) */
@media (pointer: coarse) {
  .copy,
  .web {
    min-block-size: 2.75rem;
    display: inline-flex;
    align-items: center;
  }
}
</style>
