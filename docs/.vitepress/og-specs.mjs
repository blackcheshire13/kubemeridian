// What each social card shows, resolved from the page sources. scripts/og-cards.mjs draws
// these specs and stores them in public/og/manifest.json; the docs build recomputes them and
// fails if any card is missing, orphaned or drawn from different inputs.
import { blogPosts, readFrontmatter } from './blog.mjs';

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

function fromPage(slug, file, kicker, accent, sub) {
  const [title, rest] = split(String(readFrontmatter(file).title));
  return { slug, kicker, accent, title, sub: sub ?? rest };
}

export function cardSpecs() {
  return [
    { slug: 'home', kicker: 'devopstech', accent: ACCENT.hub, title: 'Production engineering, closed loop.', sub: 'ICE · deusex · KubeMeridian' },
    fromPage('ice', 'ice/index.md', 'devopstech · ICE', ACCENT.ice),
    fromPage('ice-how-it-works', 'ice/how-it-works.md', 'devopstech · ICE', ACCENT.ice, 'Operator, agent, trust path, posture and responses'),
    fromPage('deusex', 'deusex/index.md', 'devopstech · deusex', ACCENT.deusex),
    fromPage('deusex-method', 'deusex/method.md', 'devopstech · deusex', ACCENT.deusex),
    { slug: 'kubemeridian', kicker: 'devopstech · open source', accent: ACCENT.km, title: 'KubeMeridian', sub: 'Kubernetes observability for Grafana in one app plugin' },
    { slug: 'blog', kicker: 'devopstech', accent: ACCENT.hub, title: 'Blog', sub: 'Kubernetes, security, autonomous development and observability' },
    { slug: 'about', kicker: 'devopstech', accent: ACCENT.hub, title: 'About me', sub: 'The engineer behind ICE, deusex and KubeMeridian' },
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
