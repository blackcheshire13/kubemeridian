import { defineConfigWithTheme, type MarkdownRenderer } from 'vitepress';
import type { SiteTheme } from './theme/types';
import { SITE_DESCRIPTION, checkOgCards, pageHead, sitemapLastmod, writeFeed, writeHeaders } from './site-meta';

// Tables keep their semantics and their column names when CSS stacks them on phones:
// explicit ARIA roles, and each cell carries its column header as data-label.
function tableLabels(md: MarkdownRenderer) {
  const ROLES: Record<string, string> = {
    thead_open: 'rowgroup',
    tbody_open: 'rowgroup',
    tr_open: 'row',
    th_open: 'columnheader',
    td_open: 'cell',
  };
  // VitePress renders <table> with its own rule, so the role is added there
  const tableOpen = md.renderer.rules.table_open;
  md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
    (tableOpen ? tableOpen(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)).replace(
      '<table',
      '<table role="table"',
    );
  md.core.ruler.push('dt_table_labels', (state) => {
    let headers: string[] = [];
    let inHead = false;
    let col = 0;
    state.tokens.forEach((token, i) => {
      const role = ROLES[token.type];
      if (role) {
        token.attrSet('role', role);
      }
      if (token.type === 'table_open') {
        headers = [];
      } else if (token.type === 'thead_open') {
        inHead = true;
      } else if (token.type === 'thead_close') {
        inHead = false;
      } else if (token.type === 'tr_open') {
        col = 0;
      } else if (token.type === 'th_open' && inHead) {
        headers.push((state.tokens[i + 1]?.content ?? '').replace(/[`*_]/g, ''));
      } else if (token.type === 'td_open') {
        const header = headers[col++];
        if (header) {
          token.attrSet('data-label', header);
        }
      }
    });
  });
}

// devopstech.net — the home of ICE; deusex (how ICE is built), news, blog, and the KubeMeridian archive page
export default defineConfigWithTheme<SiteTheme>({
  lang: 'en-US',
  title: 'devopstech',
  description: SITE_DESCRIPTION,
  cleanUrls: true,
  // docs/README.md is the deploy note for this folder, not a page of the site
  srcExclude: ['README.md'],
  head: [
    // ICE mark: the 16 px icon is drawn on its own pixel grid, the 32 px one scaled down would blur
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#1f2a36' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Geologica:slnt,wght@-12..0,400..700&family=JetBrains+Mono:wght@400;600&display=swap',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'devopstech' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'devopstech — blog', href: '/feed.xml' }],
  ],
  markdown: {
    // high-contrast light theme: github-light comments and operators fall below 4.5:1 on paper
    // high-contrast themes on both sides: comments must pass AA on the site's code background
    theme: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
    config: tableLabels,
  },
  transformPageData(pageData) {
    const rel = pageData.relativePath;
    // search results show ~60 characters of a title: a page may carry a shorter `seoTitle`,
    // and the " | devopstech" suffix is dropped where it would push the title past that
    if (typeof pageData.frontmatter.seoTitle === 'string') {
      pageData.title = pageData.frontmatter.seoTitle;
    }
    // VitePress reads the template from pageData.titleTemplate (copied from front matter earlier)
    if (pageData.frontmatter.titleTemplate === undefined && `${pageData.title} | devopstech`.length > 60) {
      pageData.titleTemplate = false;
      pageData.frontmatter.titleTemplate = false;
    }
    // product pages navigate with their section tabs, the blog index is already a list of posts
    if (/^(ice|deusex|news)\//.test(rel) || rel === 'about.md') {
      pageData.frontmatter.prev = false;
      pageData.frontmatter.next = false;
    }
  },
  transformHead: ({ pageData }) => pageHead(pageData),
  buildEnd: ({ outDir }) => {
    checkOgCards();
    writeFeed(outDir);
    writeHeaders(outDir);
  },
  themeConfig: {
    logo: { light: '/ice-mark.svg', dark: '/ice-mark-dark.svg', alt: 'ICE logo' },
    siteTitle: 'ICE',
    nav: [
      { text: 'ICE', link: '/ice/', activeMatch: '^/ice/' },
      { text: 'News', link: '/news/', activeMatch: '^/news/' },
      { text: 'Blog', link: '/blog/', activeMatch: '^/blog/' },
      { text: 'About', link: '/about' },
    ],
    footer: {
      message:
        'ICE is built by <a href="/deusex/">deusex</a> · <a href="/news/">News</a> · <a href="/blog/">Blog</a> · <a href="/feed.xml">RSS</a> · <a href="https://www.linkedin.com/in/black-cmd-devops">LinkedIn</a> · <a href="https://github.com/blackcheshire13">GitHub</a> · <a href="/kubemeridian">KubeMeridian</a> (archived)',
      copyright: '© 2026 devopstech · devopstech.net',
    },
    // no site search until the ICE documentation section exists; it will search that
  },
  sitemap: { hostname: 'https://devopstech.net', transformItems: sitemapLastmod },
});
