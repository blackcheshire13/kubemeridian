// Build-time helpers for devopstech.net: blog sidebar, per-page social meta, RSS feed.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HeadConfig, PageData } from 'vitepress';
import { DOCS, blogPosts, isoDate } from './blog.mjs';
import { cardSpecs } from './og-specs.mjs';
import { KM_LAST_RELEASE, isKubeMeridianPage } from './kubemeridian.mjs';

export const SITE = 'https://devopstech.net';
export const SITE_TITLE = 'devopstech';
export const SITE_DESCRIPTION =
  'An engineering workshop: active defence for Kubernetes (ICE) and an autonomous development loop (deusex), plus the archived KubeMeridian plugin for Grafana.';

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
  for (const candidate of [slug, isKubeMeridianPage(relativePath) ? 'kubemeridian' : '', 'home']) {
    if (candidate && existsSync(join(OG_DIR, `${candidate}.png`))) return `${SITE}/og/${candidate}.png`;
  }
  return `${SITE}/devopstech.svg`;
}

const PUBLISHER = { '@type': 'Organization', name: SITE_TITLE, url: `${SITE}/`, logo: `${SITE}/devopstech.svg` };

// Pages that describe a piece of software, for schema.org SoftwareApplication.
const SOFTWARE: Record<string, Record<string, unknown>> = {
  'ice/index.md': { name: 'ICE', applicationCategory: 'SecurityApplication', operatingSystem: 'Kubernetes' },
  'deusex/index.md': { name: 'deusex', applicationCategory: 'DeveloperApplication' },
  'kubemeridian.md': {
    name: 'KubeMeridian',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Grafana',
    softwareVersion: KM_LAST_RELEASE.replace(/^v/, ''),
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    sameAs: 'https://github.com/blackcheshire13/kubemeridian',
  },
};
// Long-form pages that explain one of them.
const ABOUT: Record<string, string> = { 'ice/how-it-works.md': 'ICE', 'deusex/method.md': 'deusex' };

function structuredData(pageData: PageData, title: string, description: string, url: string, image: string) {
  const rel = pageData.relativePath;
  if (rel === 'index.md') {
    return { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_TITLE, url: `${SITE}/`, description, publisher: PUBLISHER };
  }
  if (SOFTWARE[rel]) {
    return { '@context': 'https://schema.org', '@type': 'SoftwareApplication', ...SOFTWARE[rel], description, url, image, publisher: PUBLISHER };
  }
  if (ABOUT[rel]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description,
      url,
      image,
      about: { '@type': 'SoftwareApplication', name: ABOUT[rel] },
      author: PUBLISHER,
      publisher: PUBLISHER,
    };
  }
  if (rel.startsWith('blog/') && rel !== 'blog/index.md' && pageData.frontmatter.date) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      url,
      mainEntityOfPage: url,
      image,
      datePublished: isoDate(pageData.frontmatter.date),
      ...(pageData.lastUpdated ? { dateModified: new Date(pageData.lastUpdated).toISOString() } : {}),
      keywords: Array.isArray(pageData.frontmatter.tags) ? pageData.frontmatter.tags.join(', ') : undefined,
      author: PUBLISHER,
      publisher: PUBLISHER,
    };
  }
  return null;
}

// <head> additions for every page: canonical URL, Open Graph / Twitter cards, JSON-LD.
export function pageHead(pageData: PageData): HeadConfig[] {
  const title = pageData.frontmatter.title || pageData.title || SITE_TITLE;
  const description = pageData.frontmatter.description || pageData.description || SITE_DESCRIPTION;
  const url = SITE + pagePath(pageData.relativePath);
  const image = ogImage(pageData.relativePath);
  const isPost = pageData.relativePath.startsWith('blog/') && !pageData.relativePath.endsWith('index.md');
  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
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
  const data = structuredData(pageData, title, description, url, image);
  if (data) {
    // `<` escaped so a title can never close the script element
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')]);
  }
  return head;
}

// The cards are rendered by hand and committed, so the build refuses to ship a page whose
// card is missing, orphaned, or drawn from inputs (title, date, accent…) that have changed.
export function checkOgCards() {
  const manifestFile = join(OG_DIR, 'manifest.json');
  const manifest: Record<string, unknown> = existsSync(manifestFile)
    ? JSON.parse(readFileSync(manifestFile, 'utf8'))
    : {};
  const specs = cardSpecs();
  const problems = [
    ...specs.flatMap((spec) => {
      if (!existsSync(join(OG_DIR, `${spec.slug}.png`))) {
        return [`og/${spec.slug}.png is missing`];
      }
      if (JSON.stringify(manifest[spec.slug]) !== JSON.stringify(spec)) {
        return [`og/${spec.slug}.png is stale`];
      }
      return [];
    }),
    ...Object.keys(manifest)
      .filter((slug) => !specs.some((s) => s.slug === slug))
      .map((slug) => `og/${slug}.png belongs to a page that no longer exists — delete it`),
  ];
  if (problems.length) {
    throw new Error(
      `social cards are out of date:\n  ${problems.join('\n  ')}\n` +
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
