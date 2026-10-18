// Build-time helpers for devopstech.net: blog sidebar, per-page social meta, RSS feed.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HeadConfig, PageData } from 'vitepress';

export const SITE = 'https://devopstech.net';
export const SITE_TITLE = 'devopstech';
export const SITE_DESCRIPTION =
  'An engineering workshop: active defence for Kubernetes (ICE), an autonomous development loop (deusex), and open-source observability (KubeMeridian).';

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..');

export interface BlogPost {
  slug: string;
  title: string;
  sidebarTitle: string;
  date: string;
  description: string;
}

// Only single-line `key: value` frontmatter fields are read here — enough for the blog.
function frontmatter(file: string): Record<string, string> {
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  for (const line of m?.[1].split('\n') ?? []) {
    const kv = line.match(/^([A-Za-z]+):\s*(.+)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  return out;
}

export function blogPosts(): BlogPost[] {
  const dir = join(DOCS, 'blog');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => {
      const fm = frontmatter(join(dir, f));
      if (!fm.title || !fm.date) throw new Error(`blog/${f} needs "title" and "date" in its frontmatter`);
      return {
        slug: f.replace(/\.md$/, ''),
        title: fm.title,
        sidebarTitle: fm.sidebarTitle || fm.title,
        date: fm.date.slice(0, 10),
        description: fm.description ?? '',
      };
    })
    // same order as theme/posts.data.ts: newest first, same-day posts by title
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

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
  const p = relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1');
  return '/' + p;
}

// public/og/<slug>.png, rendered by scripts/og-cards.mjs; guide pages share the KubeMeridian card.
function ogImage(relativePath: string): string {
  const path = pagePath(relativePath);
  const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const candidate of [slug, path.startsWith('/guide/') ? 'kubemeridian' : '', 'home']) {
    if (candidate && existsSync(join(DOCS, 'public', 'og', `${candidate}.png`))) return `${SITE}/og/${candidate}.png`;
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
