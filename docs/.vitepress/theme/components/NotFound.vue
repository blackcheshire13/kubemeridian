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
/* the site's container between the site's gutter (custom.css), like every other page */
.nf {
  box-sizing: border-box;
  max-inline-size: calc(var(--dt-container) + 2 * var(--dt-gutter));
  margin-inline: auto;
  padding-block: clamp(3rem, 1rem + 6vw, 6rem) 6rem;
  padding-inline: var(--dt-gutter);
}
.code {
  margin-block: 0 0.75rem;
  margin-inline: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  color: var(--vp-c-text-2);
}
h1 {
  margin: 0;
  font-family: var(--dt-font-display);
  font-size: clamp(2.25rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.lede {
  margin-block: 1.25rem 0;
  margin-inline: 0;
  max-inline-size: 35rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
ul {
  margin-block: 1.5rem 0;
  margin-inline: 0;
  padding: 0;
  list-style: none;
  border-block-start: 1px solid var(--vp-c-divider);
  max-inline-size: 35rem;
}
li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-block-size: 3rem;
  font-size: 1.0625rem;
  color: var(--vp-c-text-2);
  border-block-end: 1px solid var(--vp-c-divider);
}
a {
  display: inline-flex;
  align-items: center;
  min-block-size: 3rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
