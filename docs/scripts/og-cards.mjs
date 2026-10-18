#!/usr/bin/env node
// Renders 1200×630 social cards into public/og/<slug>.png with headless Chromium.
// Usage (from docs/):  CHROME_BIN=/path/to/chrome node scripts/og-cards.mjs
// Re-run after adding a page or a post; the PNGs are committed.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DOCS, blogPosts, readFrontmatter } from '../.vitepress/blog.mjs';

const OUT = join(DOCS, 'public', 'og');
const CHROME = process.env.CHROME_BIN || 'chromium';

const ACCENT = {
  ice: 'oklch(0.52 0.1 225)',
  deusex: 'oklch(0.66 0.13 72)',
  km: '#326ce5',
  hub: 'oklch(0.74 0.135 78)',
};

// "ICE — active defence…" / "Live needs evidence: how ICE…" → big title + subtitle
function split(title) {
  const m = title.match(/^(.+?)(?: — |: )(.+)$/);
  return m ? [m[1], m[2].charAt(0).toUpperCase() + m[2].slice(1)] : [title, ''];
}

const cards = [
  { slug: 'home', kicker: 'devopstech', accent: ACCENT.hub, title: 'Production engineering, closed loop.', sub: 'ICE · deusex · KubeMeridian' },
  { slug: 'ice', file: 'ice/index.md', kicker: 'devopstech · ICE', accent: ACCENT.ice },
  { slug: 'ice-how-it-works', file: 'ice/how-it-works.md', kicker: 'devopstech · ICE', accent: ACCENT.ice, sub: 'Operator, agent, trust path, posture and responses' },
  { slug: 'deusex', file: 'deusex/index.md', kicker: 'devopstech · deusex', accent: ACCENT.deusex },
  { slug: 'deusex-method', file: 'deusex/method.md', kicker: 'devopstech · deusex', accent: ACCENT.deusex },
  { slug: 'kubemeridian', kicker: 'devopstech · open source', accent: ACCENT.km, title: 'KubeMeridian', sub: 'Kubernetes observability for Grafana in one app plugin' },
  { slug: 'blog', kicker: 'devopstech', accent: ACCENT.hub, title: 'Blog', sub: 'Kubernetes, security, autonomous development and observability' },
  { slug: 'about', kicker: 'devopstech', accent: ACCENT.hub, title: 'About me', sub: 'The engineer behind ICE, deusex and KubeMeridian' },
  ...blogPosts().map((p) => ({
    slug: `blog-${p.slug}`,
    file: p.file,
    kicker: `devopstech · blog · ${p.date}`,
    accent: p.tags[0] === 'ice' ? ACCENT.ice : p.tags[0] === 'deusex' ? ACCENT.deusex : ACCENT.km,
  })),
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const size = (t) => (t.length <= 14 ? 132 : t.length <= 26 ? 104 : t.length <= 44 ? 84 : 70);

function html({ kicker, accent, title, sub }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400&family=Atkinson+Hyperlegible+Next:wght@400&family=Bricolage+Grotesque:opsz,wght@12..96,800&display=block">
<style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: oklch(0.975 0.008 85); color: oklch(0.25 0.03 252); font-family: 'Atkinson Hyperlegible Next', sans-serif; }
  .card { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 70px 88px 0; }
  .kicker { display: flex; align-items: center; gap: 16px; font-size: 30px; color: oklch(0.42 0.025 252); }
  .dot { width: 18px; height: 18px; border-radius: 50%; background: ${accent}; }
  .rule { height: 4px; background: oklch(0.25 0.03 252); margin: 34px 0 40px; }
  h1 { margin: 0; max-width: 980px; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: ${size(title)}px; line-height: 1.02; letter-spacing: -0.02em; }
  .sub { margin-top: 26px; max-width: 900px; font-size: 36px; line-height: 1.32; color: oklch(0.42 0.025 252); }
  .foot { position: absolute; left: 88px; bottom: 56px; font: 26px 'Atkinson Hyperlegible Mono', monospace; color: oklch(0.42 0.025 252); }
  .mark { position: absolute; right: 88px; bottom: 44px; width: 104px; height: 104px; }
</style></head><body><div class="card">
  <div class="kicker"><span class="dot"></span>${esc(kicker)}</div>
  <div class="rule"></div>
  <h1>${esc(title)}</h1>
  ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
  <div class="foot">devopstech.net</div>
  <svg class="mark" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1f2a36"/><path d="M21.79 9.11 A9 9 0 1 0 25 16" fill="none" stroke="#f1ebe0" stroke-width="3.2" stroke-linecap="round"/><circle cx="25" cy="16" r="3.1" fill="#e2a93b"/></svg>
</div></body></html>`;
}

mkdirSync(OUT, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'og-cards-'));
const manifest = {};
try {
  for (const card of cards) {
    let { title, sub } = card;
    const source = card.file ? String(readFrontmatter(card.file).title) : title;
    manifest[card.slug] = card.file ? { file: card.file, title: source } : { title: source };
    if (card.file) {
      const [big, rest] = split(source);
      title ??= big;
      sub ??= rest;
    }
    const page = join(tmp, `${card.slug}.html`);
    writeFileSync(page, html({ ...card, title, sub }));
    execFileSync(CHROME, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      '--virtual-time-budget=6000', '--window-size=1200,630',
      `--screenshot=${join(OUT, `${card.slug}.png`)}`, `file://${page}`,
    ], { stdio: 'ignore' });
    console.log(`og/${card.slug}.png`);
  }
  // read by checkOgCards() in the docs build to catch missing or stale cards
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
