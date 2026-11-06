<script setup lang="ts">
// "ICE · devopstech" in the navbar: the product first, the workshop that makes it second.
</script>

<template>
  <span class="brand-suffix" aria-hidden="true">devopstech</span>
</template>

<style scoped>
.brand-suffix {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  padding-left: 10px;
  height: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  border-left: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}
/* 768–959 px shows the full nav in one row; without this the bar is wider than the screen */
@media (min-width: 768px) and (max-width: 959.98px) {
  .brand-suffix {
    display: none;
  }
}
</style>
