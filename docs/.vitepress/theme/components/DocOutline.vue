<script setup lang="ts">
// "On this page": the page's h2 headings (or the levels the page's `outline` front matter asks
// for), read from the rendered content; the section being read is marked as the page scrolls.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { getScrollOffset, onContentUpdated, useData } from 'vitepress';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const { frontmatter } = useData();
const headings = ref<Heading[]>([]);
const active = ref<string | null>(null);
const list = ref<HTMLElement | null>(null);
const markerTop = ref(0);

const levels = computed<[number, number]>(() => {
  const o = frontmatter.value.outline;
  if (typeof o === 'number') return [o, o];
  if (Array.isArray(o)) return [o[0], o[1]];
  if (o === 'deep') return [2, 6];
  return [2, 2];
});

function collect() {
  const [high, low] = levels.value;
  headings.value = [...document.querySelectorAll<HTMLElement>('.dt-doc .dt-prose :where(h2,h3,h4,h5,h6)')]
    .map((el) => {
      const copy = el.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('.header-anchor, .ignore-header').forEach((n) => n.remove());
      return { id: el.id, text: copy.textContent?.trim() ?? '', level: Number(el.tagName[1]) };
    })
    .filter((h) => h.id && h.text && h.level >= high && h.level <= low);
  if (visible) onScroll();
}

// the last heading above the reading line, or the last one at the bottom of the page
function onScroll() {
  // the same reading line the router scrolls hash links to
  const offset = getScrollOffset();
  const y = window.scrollY;
  const atBottom = Math.abs(y + window.innerHeight - document.body.offsetHeight) < 1;
  let current: string | null = null;
  if (y >= 1 && headings.value.length) {
    if (atBottom) {
      current = headings.value[headings.value.length - 1].id;
    } else {
      for (const h of headings.value) {
        const el = document.getElementById(h.id);
        if (!el || el.getBoundingClientRect().top + y > y + offset + 4) break;
        current = h.id;
      }
    }
  }
  active.value = current;
  const link = current ? list.value?.querySelector<HTMLElement>(`a[href="#${CSS.escape(current)}"]`) : null;
  // the bar sits on the link's first line; offsets are within the list, the list within the nav
  if (link && list.value) markerTop.value = list.value.offsetTop + link.offsetTop + parseFloat(getComputedStyle(link).paddingTop);
}

let frame = 0;
const onScrollFrame = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(onScroll);
};
// The outline is hidden where the page has no room for it (phones, tablets): there the scroll
// listener is detached, so no heading is measured for an outline nobody sees. The observer also
// re-places the marker when the outline's own layout changes (resize, the reader's font size,
// the aside appearing) and long entries rewrap.
const root = ref<HTMLElement | null>(null);
let visible = false;
let observer: ResizeObserver | null = null;
function onLayout(entries: ResizeObserverEntry[]) {
  const shown = entries.some((e) => e.contentRect.height > 0);
  if (shown !== visible) {
    visible = shown;
    if (shown) window.addEventListener('scroll', onScrollFrame, { passive: true });
    else window.removeEventListener('scroll', onScrollFrame);
  }
  if (shown) onScrollFrame();
}
onContentUpdated(collect);
onMounted(() => {
  collect();
  observer = new ResizeObserver(onLayout);
  if (root.value) observer.observe(root.value);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  window.removeEventListener('scroll', onScrollFrame);
});
</script>

<template>
  <nav v-show="headings.length" ref="root" class="outline" aria-labelledby="outline-title">
    <p id="outline-title" class="title">On this page</p>
    <ul ref="list">
      <li v-for="h in headings" :key="h.id" :class="`level-${h.level}`">
        <a :href="`#${h.id}`" :class="{ active: h.id === active }">{{ h.text }}</a>
      </li>
    </ul>
    <span class="marker" :class="{ on: active }" :style="{ insetBlockStart: `${markerTop}px` }" aria-hidden="true"></span>
  </nav>
</template>

<style scoped>
/* pinned under the navbar while the page scrolls; long outlines scroll on their own */
.outline {
  position: sticky;
  inset-block-start: calc(var(--dt-nav-height) + 3rem);
  max-block-size: calc(100dvh - var(--dt-nav-height) - 4rem);
  overflow-y: auto;
  padding-inline-start: 1rem;
  border-inline-start: 1px solid var(--dt-rule);
}
.title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 2rem;
}
ul {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}
a {
  display: block;
  padding-block: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--dt-ink-2);
  transition: color 0.25s;
}
a:hover,
a.active {
  color: var(--dt-ink);
}
.level-3 a { padding-inline-start: 0.8125rem; }
.level-4 a { padding-inline-start: 1.625rem; }
/* a 2px bar on the rule, next to the section being read */
.marker {
  position: absolute;
  inset-inline-start: -1px;
  inline-size: 2px;
  block-size: calc(0.875rem * 1.4);
  border-radius: 2px;
  background-color: var(--dt-link);
  opacity: 0;
  transition: inset-block-start 0.25s cubic-bezier(0, 1, 0.5, 1), opacity 0.25s;
}
.marker.on {
  opacity: 1;
}
</style>
