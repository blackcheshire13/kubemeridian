// Build-time helpers for devopstech.net: per-page social meta, RSS feed, social-card check.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { HeadConfig, PageData } from 'vitepress';
import { DOCS, blogPosts, isoDate, readFrontmatter } from './blog.mjs';
import { cardSpecs, templateHash } from './og-specs.mjs';
import { KM_LAST_RELEASE, isKubeMeridianPage } from './kubemeridian.mjs';

export const SITE = 'https://devopstech.net';
export const SITE_TITLE = 'devopstech';
export const SITE_DESCRIPTION =
  'ICE turns Kubernetes security findings into GitOps pull requests you approve and closes a case only after the cluster is measured again. Built with deusex, an autonomous development loop.';

const OG_DIR = join(DOCS, 'public', 'og');

function pagePath(relativePath: string): string {
  return '/' + relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1');
}

// public/og/<slug>.png, rendered by scripts/og-cards.mjs.
function ogImage(relativePath: string): string {
  const path = pagePath(relativePath);
  const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  for (const candidate of [slug, isKubeMeridianPage(relativePath) ? 'kubemeridian' : '', 'home']) {
    if (candidate && existsSync(join(OG_DIR, `${candidate}.png`))) return `${SITE}/og/${candidate}.png`;
  }
  return `${SITE}/apple-touch-icon.png`;
}

const PUBLISHER = { '@type': 'Organization', name: SITE_TITLE, url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png` };
// The organization behind the site, with the profiles search engines can tie it to.
const ORGANIZATION = {
  ...PUBLISHER,
  '@id': `${SITE}/#organization`,
  sameAs: ['https://github.com/devopstech-net', 'https://www.linkedin.com/in/black-cmd-devops'],
};
// The posts are first-person writing by the engineer behind devopstech.
const AUTHOR = {
  '@type': 'Person',
  name: 'Artur Stepanchenko',
  url: `${SITE}/about`,
  sameAs: ['https://www.linkedin.com/in/black-cmd-devops', 'https://github.com/blackcheshire13'],
};

// What a product page is about. ICE and deusex are not released, so they are described as the
// subject of a WebPage rather than as SoftwareApplication (which expects offers / ratings).
const PRODUCT: Record<string, Record<string, unknown>> = {
  'ice/index.md': { '@type': 'Thing', name: 'ICE', alternateName: 'ICE for Kubernetes' },
  'deusex/index.md': { '@type': 'Thing', name: 'deusex' },
  'ice/how-it-works.md': { '@type': 'Thing', name: 'ICE' },
  'deusex/method.md': { '@type': 'Thing', name: 'deusex' },
  'ice/design-partners.md': { '@type': 'Thing', name: 'ICE' },
};
// Other pages' types: an about page about a person, collections of updates and posts.
const PAGE_TYPE: Record<string, string> = {
  'about.md': 'AboutPage',
  'news/index.md': 'CollectionPage',
  'blog/index.md': 'CollectionPage',
};
// Breadcrumb trail: home, then the section, then the page itself.
const SECTION: Record<string, { name: string; path: string }> = {
  ice: { name: 'ICE', path: '/ice/' },
  deusex: { name: 'deusex', path: '/deusex/' },
  blog: { name: 'Blog', path: '/blog/' },
};
const KUBEMERIDIAN = {
  '@type': 'SoftwareApplication',
  name: 'KubeMeridian',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Grafana',
  softwareVersion: KM_LAST_RELEASE.replace(/^v/, ''),
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  sameAs: 'https://github.com/blackcheshire13/kubemeridian',
};

function isPost(relativePath: string) {
  return /^blog\/[^/]+\.md$/.test(relativePath) && relativePath !== 'blog/index.md';
}

function structuredData(pageData: PageData, title: string, description: string, url: string, image: string) {
  const rel = pageData.relativePath;
  const base = { '@context': 'https://schema.org', url, image, publisher: PUBLISHER };
  const modified = pageData.frontmatter.updated ? { dateModified: isoDate(pageData.frontmatter.updated) } : {};
  if (rel === 'index.md') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', '@id': `${SITE}/#website`, name: SITE_TITLE, url: `${SITE}/`, description, image, publisher: { '@id': ORGANIZATION['@id'] } },
        ORGANIZATION,
      ],
    };
  }
  if (PAGE_TYPE[rel]) {
    return {
      ...base,
      '@type': PAGE_TYPE[rel],
      name: title,
      description,
      ...modified,
      ...(rel === 'about.md' ? { mainEntity: AUTHOR } : {}),
    };
  }
  if (rel === 'kubemeridian.md') {
    return { ...base, ...KUBEMERIDIAN, description };
  }
  if (PRODUCT[rel]) {
    const type = rel.endsWith('index.md') || rel === 'ice/design-partners.md' ? 'WebPage' : 'TechArticle';
    return { ...base, '@type': type, name: title, headline: title, description, about: PRODUCT[rel], author: AUTHOR, ...modified };
  }
  if (isPost(rel) && pageData.frontmatter.date) {
    return {
      ...base,
      '@type': 'BlogPosting',
      headline: title,
      description,
      mainEntityOfPage: url,
      datePublished: isoDate(pageData.frontmatter.date),
      // only an explicit `updated:` counts; git dates move on front-matter-only commits
      ...(pageData.frontmatter.updated ? { dateModified: isoDate(pageData.frontmatter.updated) } : {}),
      keywords: Array.isArray(pageData.frontmatter.tags) ? pageData.frontmatter.tags.join(', ') : undefined,
      author: AUTHOR,
    };
  }
  return null;
}

// <head> additions for every page: canonical URL, Open Graph / Twitter cards, JSON-LD.
export function pageHead(pageData: PageData): HeadConfig[] {
  if (pageData.relativePath === '404.md') {
    return [];
  }
  const title = pageData.frontmatter.title || pageData.title || SITE_TITLE;
  const description = pageData.frontmatter.description || pageData.description || SITE_DESCRIPTION;
  const url = SITE + pagePath(pageData.relativePath);
  const image = ogImage(pageData.relativePath);
  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: isPost(pageData.relativePath) ? 'article' : 'website' }],
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
  // `<` escaped so a title can never close the script element
  for (const data of [structuredData(pageData, title, description, url, image), breadcrumbs(pageData.relativePath, title, url)]) {
    if (data) {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')]);
    }
  }
  return head;
}

function breadcrumbs(rel: string, title: string, url: string) {
  if (rel === 'index.md') {
    return null;
  }
  const trail = [{ name: SITE_TITLE, item: `${SITE}/` }];
  const section = SECTION[rel.split('/')[0]];
  if (section && SITE + section.path !== url) {
    trail.push({ name: section.name, item: SITE + section.path });
  }
  trail.push({ name: title, item: url });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: t.item })),
  };
}

// Sitemap <lastmod> from front matter (`updated:`, or a post's `date:`), never from git.
// typed by shape: VitePress does not export its SitemapItem (lastmod: string | number | Date)
export function sitemapLastmod<T extends { url: string; lastmod?: string | number | Date }>(items: T[]): T[] {
  return items.map((item) => {
    const path = item.url.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
    const file = path === '' ? 'index.md' : path.endsWith('/') ? `${path}index.md` : `${path}.md`;
    let data: Record<string, unknown> = {};
    try {
      data = readFrontmatter(file);
    } catch {
      return item;
    }
    const date = data.updated || data.date;
    return date ? { ...item, lastmod: isoDate(date) } : item;
  });
}

// The cards are rendered by hand and committed, so the build refuses to ship a page whose
// card is missing, orphaned, or drawn from inputs (title, date, accent…, or the renderer and
// its mark files) that have changed.
export function checkOgCards() {
  const manifestFile = join(OG_DIR, 'manifest.json');
  const manifest: Record<string, unknown> = existsSync(manifestFile)
    ? JSON.parse(readFileSync(manifestFile, 'utf8'))
    : {};
  const specs = cardSpecs();
  const template = manifest.__template === templateHash() ? [] : ['the card template or a mark file changed since the cards were drawn'];
  const problems = [
    ...template,
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
      .filter((slug) => slug !== '__template' && !specs.some((s) => s.slug === slug))
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

// Cloudflare Pages response headers (dist/_headers), written after the build because the CSP
// pins VitePress's inline scripts by hash and one of them (the page hash map) changes with
// every build. Long caching for hashed assets; security headers on every page.
export function writeHeaders(outDir: string) {
  const html: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        walk(p);
      } else if (e.name.endsWith('.html')) {
        html.push(readFileSync(p, 'utf8'));
      }
    }
  };
  walk(outDir);
  const hashes = new Set<string>();
  for (const page of html) {
    for (const m of page.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type="(?!module|text\/javascript)[^"]+"/.test(m[1])) {
        continue; // JSON-LD and other data blocks are never executed
      }
      hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
    }
  }
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].sort().join(' ')} https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  const rules = [
    ['/*', [
      'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      'X-Frame-Options: DENY',
      'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      `Content-Security-Policy: ${csp}`,
    ]],
    // content-hashed file names never change: cache for a year
    ['/assets/*', ['Cache-Control: public, max-age=31536000, immutable']],
    ['/screenshots/*', ['Cache-Control: public, max-age=604800']],
    ['/og/*', ['Cache-Control: public, max-age=604800']],
  ] as const;
  const out = rules.map(([path, lines]) => [path, ...lines.map((l) => `  ${l}`)].join('\n')).join('\n');
  writeFileSync(join(outDir, '_headers'), out + '\n');
}
