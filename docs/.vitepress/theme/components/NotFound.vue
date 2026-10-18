<template>
  <div class="nf">
    <p class="code">404</p>
    <h1>This page doesn't exist</h1>
    <p class="lede">The link may be old, or the page moved. These are the places most people are looking for:</p>
    <ul>
      <li><a href="/ice/">ICE</a> — active defence for Kubernetes</li>
      <li><a href="/deusex/">deusex</a> — the autonomous development loop</li>
      <li><a href="/blog/">Blog</a> — field notes</li>
      <li><a href="/">Home</a></li>
    </ul>
  </div>
</template>

<style scoped>
.nf {
  max-width: 1152px;
  margin: 0 auto;
  padding: clamp(48px, 8vw, 96px) 24px 96px;
}
.code {
  margin: 0 0 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 16px;
  color: var(--vp-c-text-2);
}
h1 {
  margin: 0;
  font-family: var(--dt-font-display);
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.lede {
  margin: 20px 0 0;
  max-width: 560px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
ul {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  border-top: 2px solid var(--vp-c-text-1);
  max-width: 560px;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  font-size: 17px;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}
a {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}
@media (max-width: 520px) {
  .nf {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
