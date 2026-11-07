<script setup lang="ts">
// The footer: one line of links and the copyright, from themeConfig.footer (trusted HTML).
import { useData } from 'vitepress';
import type { SiteTheme } from '../types';

const { theme } = useData<SiteTheme>();
</script>

<template>
  <footer class="footer">
    <div class="dt-wrap">
      <p class="line" v-html="theme.footer.message"></p>
      <p class="line" v-html="theme.footer.copyright"></p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-block: 2rem;
  border-block-start: 1px solid var(--dt-paper-3);
  background-color: var(--dt-paper);
}
.line {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5rem;
  color: var(--dt-ink-2);
}
.line :deep(a) {
  color: var(--dt-link);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.line :deep(a:hover) {
  color: var(--dt-link-2);
}
</style>
