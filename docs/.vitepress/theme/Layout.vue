<script setup lang="ts">
// The site's one layout. VitePress picks this component for every page; the page's front
// matter `layout` chooses the body: `page` (the home page, a bare component), `home` (the
// KubeMeridian archive page) or a content page (the default); a missing page gets the 404.
import { computed, ref, watch } from 'vue';
import { useData, useRoute } from 'vitepress';
import DocLayout from './components/DocLayout.vue';
import KmHome from './components/KmHome.vue';
import NotFound from './components/NotFound.vue';
import ShotLightbox from './components/ShotLightbox.vue';
import SiteFooter from './components/SiteFooter.vue';
import SiteNav from './components/SiteNav.vue';

const { page, frontmatter } = useData();
const route = useRoute();
const layout = computed(() => (page.value.isNotFound ? '404' : (frontmatter.value.layout ?? 'doc')));

// after a client-side navigation the next Tab starts at the top of the page (the skip link),
// as after a full page load
const top = ref<HTMLElement | null>(null);
watch(() => route.path, () => top.value?.focus({ preventScroll: true }));

function skip(event: MouseEvent) {
  const main = document.getElementById('main');
  if (!main) return;
  event.preventDefault();
  main.focus({ preventScroll: true });
  main.scrollIntoView();
}
</script>

<template>
  <div class="layout">
    <span ref="top" tabindex="-1"></span>
    <a class="skip-link" href="#main" @click="skip">Skip to content</a>
    <SiteNav />
    <main id="main" class="main" tabindex="-1">
      <NotFound v-if="layout === '404'" />
      <KmHome v-else-if="layout === 'home'" />
      <Content v-else-if="layout === 'page'" />
      <DocLayout v-else />
    </main>
    <SiteFooter />
    <ShotLightbox />
  </div>
</template>

<style scoped>
/* the footer sits at the bottom of the window on short pages */
.layout {
  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;
}
.main {
  flex-grow: 1;
}
.main:focus {
  outline: none;
}
/* hidden until focused by the keyboard: the first stop of Tab on every page */
.skip-link {
  position: fixed;
  inset-block-start: 0.5rem;
  inset-inline-start: 1rem;
  z-index: 100;
  padding-block: 0.5rem;
  padding-inline: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--dt-link);
  background-color: var(--dt-elv);
  border-radius: var(--dt-radius-control);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  translate: 0 -200%;
}
.skip-link:focus {
  translate: 0;
}
</style>
