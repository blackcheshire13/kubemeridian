// Build-time helpers for devopstech.net: blog sidebar, per-page social meta, RSS feed.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HeadConfig, PageData } from 'vitepress';
import { DOCS, blogPosts, readFrontmatter } from './blog.mjs';

export const SITE = 'https://devopstech.net';
export const SITE_TITLE = 'devopstech';
export const SITE_DESCRIPTION =
  'An engineering workshop: active defence for Kubernetes (ICE), an autonomous development loop (deusex), and open-source observability (KubeMeridian).';

const OG_DIR = join(DOCS, 'public', 'og');

export function blogSidebar() {
  return [
    {
      text: 'Blog',
      items: [
        { text: 'All posts', link: '/blog/' },
        ...blogPosts().map((p) => ({ text: p.sidebarTitle, link: `/blog/${p.slug}` })),
      ],
    },
  ];
}

function pagePath(relativePath: string): string {
  return '/' + relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1');
}

// public/og/<slug>.png, rendered by scripts/og-cards.mjs; guide pages share the KubeMeridian card.
function ogImage(relativePath: string): string {
  const path = pagePath(relativePath);
  const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const candidate of [slug, path.startsWith('/guide/') ? 'kubemeridian' : '', 'home']) {
    if (candidate && existsSync(join(OG_DIR, `${candidate}.png`))) return `${SITE}/og/${candidate}.png`;
  }
  return `${SITE}/devopstech.svg`;
}

export function socialHead(pageData: PageData): HeadConfig[] {
  const title = pageData.frontmatter.title || pageData.title || SITE_TITLE;
  const description = pageData.frontmatter.description || pageData.description || SITE_DESCRIPTION;
  const url = SITE + pagePath(pageData.relativePath);
  const image = ogImage(pageData.relativePath);
  const isPost = pageData.relativePath.startsWith('blog/') && !pageData.relativePath.endsWith('index.md');
  return [
    ['meta', { property: 'og:type', content: isPost ? 'article' : 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
  ];
}

// The cards are rendered by hand and committed, so the build refuses to ship a post
// without a card, or a card drawn from a title that has since changed.
export function checkOgCards() {
  const manifestFile = join(OG_DIR, 'manifest.json');
  const manifest: Record<string, { file?: string; title: string }> = existsSync(manifestFile)
    ? JSON.parse(readFileSync(manifestFile, 'utf8'))
    : {};
  const stale = [
    ...blogPosts()
      .filter((p) => !manifest[`blog-${p.slug}`])
      .map((p) => `${p.file} has no card`),
    ...Object.entries(manifest)
      .filter(([, c]) => c.file && String(readFrontmatter(c.file).title) !== c.title)
      .map(([slug, c]) => `og/${slug}.png was drawn from an old title of ${c.file}`),
  ];
  if (stale.length) {
    throw new Error(
      `social cards are out of date:\n  ${stale.join('\n  ')}\n` +
        'run from docs/: CHROME_BIN=/path/to/chrome node scripts/og-cards.mjs',
    );
  }
}

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function writeFeed(outDir: string) {
  const posts = blogPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${xml(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${xml(p.description)}</description>
    </item>`,
    )
    .join('\n');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE} — blog</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${posts[0]?.date ?? '2026-01-01'}T00:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  writeFileSync(join(outDir, 'feed.xml'), feed);
}
