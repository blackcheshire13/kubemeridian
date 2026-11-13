// What each social card shows, resolved from the page sources. scripts/og-cards.mjs draws
// these specs and stores them in public/og/manifest.json; the docs build recomputes them and
// fails if any card is missing, orphaned or drawn from different inputs.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOCS, blogPosts, readFrontmatter } from './blog.mjs';

// The brand mark drawn on a card: ICE's pages carry the ICE core sample, everything else
// (the blog included) devopstech's ring. Both are read from public/, the site's icons.
export const MARK_FILES = { devopstech: 'public/devopstech.svg', ice: 'public/favicon.svg' };

// What a card looks like depends on the renderer and the mark files too, not only on its
// spec; the manifest stores this hash so the build notices when they change.
export function templateHash() {
  const h = createHash('sha256');
  for (const f of ['scripts/og-cards.mjs', ...Object.values(MARK_FILES)]) {
    h.update(readFileSync(join(DOCS, f)));
  }
  return h.digest('hex').slice(0, 16);
}

const ACCENT = {
  ice: '#2675a9',
  deusex: 'oklch(0.66 0.13 72)',
  km: '#326ce5',
  hub: 'oklch(0.74 0.135 78)',
};

// "ICE — Kubernetes security fixes…" / "Live needs evidence: how ICE…" → big title + subtitle
/** @param {string} title @returns {[string, string]} */
function split(title) {
  const m = title.match(/^(.+?)(?: — |: )(.+)$/);
  return m ? [m[1], m[2].charAt(0).toUpperCase() + m[2].slice(1)] : [title, ''];
}

/**
 * @param {string} slug @param {string} file @param {string} kicker @param {string} accent
 * @param {string} [sub] @param {string} [mark]
 */
function fromPage(slug, file, kicker, accent, sub, mark) {
  const [title, rest] = split(String(readFrontmatter(file).title));
  return { slug, kicker, accent, title, sub: sub ?? rest, ...(mark ? { mark } : {}) };
}

export function cardSpecs() {
  return [
    { slug: 'home', kicker: 'devopstech · ICE', accent: ACCENT.ice, mark: 'ice', title: 'Kubernetes security fixes as pull requests.', sub: 'ICE · for teams without a security engineer' },
    fromPage('ice', 'ice/index.md', 'devopstech · ICE', ACCENT.ice, undefined, 'ice'),
    fromPage('ice-how-it-works', 'ice/how-it-works.md', 'devopstech · ICE', ACCENT.ice, 'Operator, agent, trust path, posture and responses', 'ice'),
    fromPage('ice-design-partners', 'ice/design-partners.md', 'devopstech · ICE', ACCENT.ice, undefined, 'ice'),
    fromPage('deusex', 'deusex/index.md', 'devopstech · deusex', ACCENT.deusex),
    fromPage('deusex-method', 'deusex/method.md', 'devopstech · deusex', ACCENT.deusex),
    { slug: 'kubemeridian', kicker: 'devopstech · archived', accent: ACCENT.km, title: 'KubeMeridian', sub: 'Kubernetes observability for Grafana in one app plugin — archived' },
    { slug: 'blog', kicker: 'devopstech', accent: ACCENT.hub, title: 'Blog', sub: 'Kubernetes, security, autonomous development and observability' },
    fromPage('news', 'news/index.md', 'devopstech', ACCENT.hub),
    { slug: 'about', kicker: 'devopstech · about', accent: ACCENT.hub, title: 'Artur Stepanchenko', sub: 'The engineer behind ICE and deusex' },
    ...blogPosts().map((p) =>
      fromPage(
        `blog-${p.slug}`,
        p.file,
        `devopstech · blog · ${p.date}`,
        p.tags[0] === 'ice' ? ACCENT.ice : p.tags[0] === 'deusex' ? ACCENT.deusex : ACCENT.km,
      ),
    ),
  ];
}
