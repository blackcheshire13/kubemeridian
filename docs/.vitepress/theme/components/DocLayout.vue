<script setup lang="ts">
// A content page: the band above the title (a product's tabs, a way back from a post, or an
// empty band of the same height), the text column, and "On this page" beside it where the page
// has room for both.
import { computed } from 'vue';
import { useData } from 'vitepress';
import { isKubeMeridianPage } from '../../kubemeridian.mjs';
import ArchivedNotice from './ArchivedNotice.vue';
import DocOutline from './DocOutline.vue';
import SectionNav from './SectionNav.vue';

const { page, frontmatter } = useData();
const archived = computed(() => isKubeMeridianPage(page.value.relativePath));
const hasOutline = computed(() => frontmatter.value.aside !== false && frontmatter.value.outline !== false);
</script>

<template>
  <div class="dt-doc dt-wrap">
    <div class="grid" :class="{ 'has-outline': hasOutline }">
      <div class="column">
        <ArchivedNotice v-if="archived" />
        <SectionNav v-else />
        <Content class="dt-prose" />
      </div>
      <aside v-if="hasOutline" class="aside">
        <DocOutline />
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* the page is the container the grid asks: the outline joins the text column only where both
   fit (45rem of text, 16rem of outline and a gap), whatever the window or the font size */
.dt-doc {
  container: doc / inline-size;
  /* 32px on a phone, 48px from 768px, fluid in between */
  padding-block: clamp(2rem, 9.5vw - 1.5625rem, 3rem) 4rem;
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 45rem);
}
.aside {
  display: none;
  padding-inline-start: 2rem;
}
@container doc (inline-size >= 64rem) {
  .grid.has-outline {
    grid-template-columns: minmax(0, 45rem) 16rem;
    justify-content: space-between;
  }
  .aside {
    display: block;
  }
}
</style>
