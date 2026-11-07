<script setup lang="ts">
// Opens a product screenshot over the page instead of navigating to the bare PNG.
// Any link inside a .dt-shot figure (or with data-lightbox) qualifies; without JavaScript
// the link still opens the image. Closes on Esc (native <dialog>), on a click anywhere
// outside the image and its caption, and on the close button; focus returns to the link.
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const dialog = ref<HTMLDialogElement | null>(null);
const src = ref('');
const alt = ref('');
const caption = ref('');
let opener: HTMLElement | null = null;

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return; // let "open in a new tab" and friends do their thing
  }
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('.dt-shot a, a[data-lightbox]');
  const img = link?.querySelector('img');
  if (!link || !img || !dialog.value) {
    return;
  }
  event.preventDefault();
  opener = link;
  src.value = link.getAttribute('href') || img.currentSrc || img.src;
  alt.value = img.alt;
  caption.value = link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() ?? '';
  document.documentElement.classList.add('dt-lightbox-open');
  dialog.value.showModal();
}

function close() {
  dialog.value?.close();
}

// the dialog fills the screen; a click that lands on it (not on the image or caption) closes it
function onDialogClick(event: MouseEvent) {
  const t = event.target as Element;
  if (!t.closest('img, figcaption')) {
    close();
  }
}

async function onClosed() {
  document.documentElement.classList.remove('dt-lightbox-open');
  src.value = '';
  await nextTick();
  opener?.focus();
  opener = null;
}

onMounted(() => document.addEventListener('click', onClick, true));
onBeforeUnmount(() => document.removeEventListener('click', onClick, true));
</script>

<template>
  <dialog ref="dialog" class="lightbox" aria-label="Screenshot" @click="onDialogClick" @close="onClosed">
    <button type="button" class="close" aria-label="Close" @click.stop="close">×</button>
    <figure v-if="src">
      <img :src="src" :alt="alt" />
      <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
  </dialog>
</template>

<style scoped>
/* the whole visible screen: 100% of the top layer, dynamic viewport height (mobile bars) */
.lightbox {
  inline-size: 100%;
  block-size: 100dvh;
  max-inline-size: none;
  max-block-size: none;
  margin: 0;
  padding: clamp(1rem, 4vw, 3rem);
  border: 0;
  background: rgb(10 14 18 / 0.92);
  color: #f1ede6;
  cursor: zoom-out;
}
.lightbox[open] {
  display: grid;
  place-items: center;
}
.lightbox::backdrop {
  background: transparent;
}
figure {
  margin: 0;
  max-inline-size: min(90rem, 100%);
  cursor: default;
}
img {
  display: block;
  max-inline-size: 100%;
  max-block-size: calc(100dvh - 8.75rem);
  inline-size: auto;
  block-size: auto;
  margin: 0 auto;
  border-radius: var(--dt-radius-card);
  box-shadow: 0 16px 48px rgb(0 0 0 / 0.5);
}
figcaption {
  max-inline-size: 72ch;
  margin-block: 0.875rem 0;
  margin-inline: auto;
  font-size: 0.9375rem;
  line-height: 1.5;
  text-align: start;
  color: #d9d4cc;
}
.close {
  position: fixed;
  inset-block-start: max(0.75rem, env(safe-area-inset-top, 0px));
  inset-inline-end: max(0.75rem, env(safe-area-inset-right, 0px));
  inline-size: 2.75rem;
  block-size: 2.75rem;
  font-size: 1.75rem;
  line-height: 1;
  color: #f1ede6;
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: var(--dt-radius-control);
  cursor: pointer;
}
.close:hover {
  background: rgb(255 255 255 / 0.16);
}
.close:focus-visible {
  outline: 2px solid #6edbfc;
  outline-offset: 2px;
}
</style>
