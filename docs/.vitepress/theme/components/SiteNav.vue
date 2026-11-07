<script setup lang="ts">
// The site's navbar and its mobile menu. Where the window is narrower than 48em (768px at the
// default font, 960px at 20px: em follows the reader's font setting) the links, the theme
// switch and the actions move into a full-screen menu behind the hamburger.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';
import type { SiteTheme } from '../types';
import NavBrandSuffix from './NavBrandSuffix.vue';
import NavCta from './NavCta.vue';
import ThemeToggle from './ThemeToggle.vue';

const WIDE = '(width >= 48em)';

const { theme, page } = useData<SiteTheme>();
const route = useRoute();

// "/ice/how-it-works" for ice/how-it-works.md, "/ice/" for ice/index.md, "/" for index.md
const path = computed(() => '/' + page.value.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''));
const trim = (p: string) => p.replace(/\/$/, '') || '/';
// the patterns are compiled once; the state of every link is computed once per page, for both
// the bar and the menu
const matchers = computed(() =>
  theme.value.nav.map((item) => (item.activeMatch ? new RegExp(item.activeMatch) : null)),
);
// active: the link is underlined; current: "page" on the link to this very page, "true" on the
// link to the section the page belongs to
const links = computed(() =>
  theme.value.nav.map((item, i) => {
    const re = matchers.value[i];
    const self = trim(item.link) === trim(path.value);
    const active = re ? re.test(path.value) : self;
    return { ...item, active, current: self ? ('page' as const) : active ? ('true' as const) : undefined };
  }),
);

const open = ref(false);
const hamburger = ref<HTMLButtonElement | null>(null);

function close(returnFocus = false) {
  if (!open.value) return;
  open.value = false;
  if (returnFocus) nextTick(() => hamburger.value?.focus());
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close(true);
}
let wide: MediaQueryList | null = null;
const onWide = (event: MediaQueryListEvent) => event.matches && close();

// the page behind the open menu does not scroll, and Tab stays in the menu: everything next
// to the navbar (the page, the footer) is inert while the menu covers it
const header = ref<HTMLElement | null>(null);
function lockPage(value: boolean) {
  document.documentElement.classList.toggle('dt-scroll-lock', value);
  for (const el of header.value?.parentElement?.children ?? []) {
    if (el !== header.value) (el as HTMLElement).inert = value;
  }
}
watch(open, lockPage);
watch(() => route.path, () => close());
onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  wide = window.matchMedia(WIDE);
  wide.addEventListener('change', onWide);
});
onBeforeUnmount(() => {
  // the watcher stops with the component, so the page is released here, not through close()
  open.value = false;
  lockPage(false);
  window.removeEventListener('keydown', onKeydown);
  wide?.removeEventListener('change', onWide);
});
</script>

<template>
  <header ref="header" class="nav" :class="{ open }">
    <div class="bar dt-wrap">
      <a class="brand" :href="withBase('/')">
        <img class="logo light-only" :src="withBase(theme.logo.light)" :alt="theme.logo.alt" width="20" height="41" />
        <img class="logo dark-only" :src="withBase(theme.logo.dark)" :alt="theme.logo.alt" width="20" height="41" />
        <span class="title">{{ theme.siteTitle }}</span>
        <NavBrandSuffix />
      </a>

      <nav class="menu" aria-label="Main">
        <a
          v-for="item in links"
          :key="item.link"
          :href="withBase(item.link)"
          :class="{ active: item.active }"
          :aria-current="item.current"
        >{{ item.text }}</a>
      </nav>
      <div class="appearance">
        <ThemeToggle />
      </div>
      <NavCta />

      <button
        ref="hamburger"
        type="button"
        class="hamburger"
        aria-label="Menu"
        :aria-expanded="open"
        aria-controls="nav-screen"
        @click="open = !open"
      >
        <span class="lines" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>
    </div>

    <Transition name="screen">
      <div v-show="open" id="nav-screen" class="screen">
        <div class="screen-body">
          <NavCta screen />
          <nav class="screen-menu" aria-label="Main">
            <a
              v-for="item in links"
              :key="item.link"
              :href="withBase(item.link)"
              :class="{ active: item.active }"
              :aria-current="item.current"
            >{{ item.text }}</a>
          </nav>
          <div class="screen-appearance">
            <span class="label">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* static on narrow windows, it scrolls away with the page; pinned from 60em, where a 4rem
   bar costs little of the window's height */
.nav {
  position: relative;
  z-index: 30;
  background-color: var(--dt-paper);
  /* the rule under the bar is drawn, not laid out: content starts right under the 4rem bar */
  box-shadow: 0 1px 0 var(--dt-paper-3);
}
@media (width >= 60em) {
  .nav {
    position: sticky;
    inset-block-start: 0;
  }
}
/* the menu opens right under the bar: a bar partly scrolled away is pinned back to the top
   while the menu is open, so the two always meet */
.nav.open {
  position: sticky;
  inset-block-start: 0;
}

.bar {
  display: flex;
  align-items: center;
  block-size: var(--dt-nav-height);
}

.brand {
  display: flex;
  align-items: center;
  block-size: 100%;
  margin-inline-end: auto;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}
.logo {
  inline-size: auto;
  block-size: 1.5rem;
  margin-inline-end: 0.5rem;
}
.dark-only,
.dark .light-only {
  display: none;
}
.dark .dark-only {
  display: block;
}

/* the full nav: links, a rule, the theme switch, the actions (NavCta) */
.menu,
.appearance {
  display: none;
}
.menu a {
  padding-inline: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: var(--dt-nav-height);
  white-space: nowrap;
  transition: color 0.25s;
}
.menu a:hover,
.menu a.active {
  color: var(--dt-link);
}
.appearance {
  align-items: center;
  margin-inline-start: 0.5rem;
}
.appearance::before {
  content: '';
  inline-size: 1px;
  block-size: 1.5rem;
  margin-inline-end: 1rem;
  background-color: var(--dt-rule);
}

/* three lines that turn into a cross; the 3rem button is pulled out by the space around its
   1rem icon, so the icon, not the button, sits on the gutter */
.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 3rem;
  block-size: var(--dt-nav-height);
  margin-inline-end: -1rem;
}
.lines {
  position: relative;
  inline-size: 1rem;
  block-size: 0.875rem;
}
.lines span {
  position: absolute;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 2px;
  background-color: var(--dt-ink-2);
  transition: inset-block-start 0.25s, transform 0.25s, opacity 0.25s, background-color 0.25s;
}
.lines span:nth-child(1) { inset-block-start: 0; }
.lines span:nth-child(2) { inset-block-start: calc(50% - 1px); }
.lines span:nth-child(3) { inset-block-start: calc(100% - 2px); }
.hamburger:hover .lines span { background-color: var(--dt-ink); }
.open .lines span:nth-child(1) { inset-block-start: calc(50% - 1px); transform: rotate(45deg); }
.open .lines span:nth-child(2) { opacity: 0; }
.open .lines span:nth-child(3) { inset-block-start: calc(50% - 1px); transform: rotate(-45deg); }

@media (width >= 48em) {
  .menu,
  .appearance {
    display: flex;
  }
  .hamburger,
  .screen {
    display: none !important;
  }
}

/* ---------- the mobile menu: the whole screen under the bar ---------- */
.screen {
  position: fixed;
  inset: var(--dt-nav-height) 0 0;
  overflow-y: auto;
  padding-inline: var(--dt-gutter);
  background-color: var(--dt-paper);
  /* the bar's rule, which the menu would otherwise cover */
  border-block-start: 1px solid var(--dt-paper-3);
}
.screen-body {
  padding-block: 1.5rem 6rem;
}
.screen-menu a {
  display: block;
  padding-block: 0.75rem calc(0.75rem - 1px);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5rem;
  border-block-end: 1px solid var(--dt-rule);
  transition: color 0.25s;
}
.screen-menu a:hover,
.screen-menu a.active {
  color: var(--dt-link);
}
.screen-appearance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-start: 1.5rem;
  padding-block: 0.75rem;
  padding-inline: 1rem 0.875rem;
  border-radius: 0.5rem;
  background-color: var(--dt-paper-2);
}
.screen-appearance .label {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--dt-ink-2);
}

.screen-enter-active,
.screen-leave-active {
  transition: opacity 0.25s, translate 0.25s;
}
.screen-enter-from,
.screen-leave-to {
  opacity: 0;
  translate: 0 -0.5rem;
}
</style>
