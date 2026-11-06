#!/usr/bin/env node
// Renders 1200×630 social cards into public/og/<slug>.png with headless Chromium.
// Usage (from docs/):  CHROME_BIN=/path/to/chrome node scripts/og-cards.mjs
// Re-run after adding a page or a post; the PNGs are committed.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DOCS } from '../.vitepress/blog.mjs';
import { MARK_FILES, cardSpecs, templateHash } from '../.vitepress/og-specs.mjs';

const OUT = join(DOCS, 'public', 'og');
const CHROME = process.env.CHROME_BIN || 'chromium';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const size = (t) => (t.length <= 14 ? 132 : t.length <= 26 ? 104 : t.length <= 44 ? 84 : 70);

// The marks' inner SVG, taken from the site's own icons so the cards cannot drift from them.
const MARK = Object.fromEntries(
  Object.entries(MARK_FILES).map(([name, file]) => [
    name,
    readFileSync(join(DOCS, file), 'utf8').replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').trim(),
  ]),
);

function html({ kicker, accent, title, sub, mark = 'devopstech' }) {
  if (!MARK[mark]) {
    throw new Error(`unknown card mark "${mark}" — expected one of ${Object.keys(MARK).join(', ')}`);
  }
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Geologica:wght@400&family=JetBrains+Mono:wght@400&display=block">
<style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: oklch(0.975 0.008 85); color: oklch(0.25 0.03 252); font-family: 'Geologica', sans-serif; }
  .card { position: relative; box-sizing: border-box; width: 1200px; height: 630px; padding: 70px 88px 0; }
  .kicker { display: flex; align-items: center; gap: 16px; font-size: 30px; color: oklch(0.42 0.025 252); }
  .dot { width: 18px; height: 18px; border-radius: 50%; background: ${accent}; }
  .rule { height: 4px; background: oklch(0.25 0.03 252); margin: 34px 0 40px; }
  h1 { margin: 0; max-width: 980px; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: ${size(title)}px; line-height: 1.02; letter-spacing: -0.02em; }
  .sub { margin-top: 26px; max-width: 900px; font-size: 36px; line-height: 1.32; color: oklch(0.42 0.025 252); }
  .foot { position: absolute; left: 88px; bottom: 56px; font: 26px 'JetBrains Mono', monospace; color: oklch(0.42 0.025 252); }
  .mark { position: absolute; right: 88px; bottom: 44px; width: 104px; height: 104px; }
</style></head><body><div class="card">
  <div class="kicker"><span class="dot"></span>${esc(kicker)}</div>
  <div class="rule"></div>
  <h1>${esc(title)}</h1>
  ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
  <div class="foot">devopstech.net</div>
  <svg class="mark" viewBox="0 0 32 32">${MARK[mark]}</svg>
</div></body></html>`;
}

mkdirSync(OUT, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'og-cards-'));
const manifest = { __template: templateHash() };
try {
  for (const card of cardSpecs()) {
    const page = join(tmp, `${card.slug}.html`);
    writeFileSync(page, html(card));
    execFileSync(CHROME, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      '--virtual-time-budget=6000', '--window-size=1200,630',
      `--screenshot=${join(OUT, `${card.slug}.png`)}`, `file://${page}`,
    ], { stdio: 'ignore' });
    manifest[card.slug] = card;
    console.log(`og/${card.slug}.png`);
  }
  // read by checkOgCards() in the docs build to catch missing or stale cards
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
