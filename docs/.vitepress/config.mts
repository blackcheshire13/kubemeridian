import { defineConfig } from 'vitepress';
import { SITE_DESCRIPTION, blogSidebar, checkOgCards, pageHead, writeFeed } from './site-meta';

// devopstech.net — engineering hub: ICE, deusex, blog, and the archived KubeMeridian docs
export default defineConfig({
  lang: 'en-US',
  title: 'devopstech',
  description: SITE_DESCRIPTION,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/devopstech.svg' }],
    ['meta', { name: 'theme-color', content: '#1f2a36' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono:wght@400;600&family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,600;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&display=swap',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'devopstech' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'devopstech — blog', href: '/feed.xml' }],
  ],
  markdown: {
    // high-contrast light theme: github-light comments and operators fall below 4.5:1 on paper
    theme: { light: 'github-light-high-contrast', dark: 'github-dark' },
  },
  transformPageData(pageData) {
    const rel = pageData.relativePath;
    // "Edit on GitHub" and "Updated" belong to the KubeMeridian guide, not to product pages or posts
    if (!rel.startsWith('guide/')) {
      pageData.frontmatter.editLink = false;
      pageData.frontmatter.lastUpdated = false;
    }
    // product pages navigate with their section tabs, the blog index is already a list of posts
    if (/^(ice|deusex)\//.test(rel) || rel === 'about.md') {
      pageData.frontmatter.prev = false;
      pageData.frontmatter.next = false;
    }
    if (rel === 'blog/index.md') {
      pageData.frontmatter.sidebar = false;
    }
  },
  transformHead: ({ pageData }) => pageHead(pageData),
  buildEnd: ({ outDir }) => {
    checkOgCards();
    writeFeed(outDir);
  },
  themeConfig: {
    logo: { light: '/devopstech.svg', dark: '/devopstech-dark.svg', alt: '' },
    siteTitle: 'devopstech',
    nav: [
      { text: 'ICE', link: '/ice/', activeMatch: '^/ice/' },
      { text: 'deusex', link: '/deusex/', activeMatch: '^/deusex/' },
      { text: 'Blog', link: '/blog/', activeMatch: '^/blog/' },
      { text: 'About', link: '/about' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'KubeMeridian',
          items: [{ text: 'Overview', link: '/kubemeridian' }],
        },
        {
          text: 'Getting started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Install', link: '/guide/install' },
            { text: 'Connect your stack', link: '/guide/connections' },
          ],
        },
        {
          text: 'Observe',
          items: [
            { text: 'Topology & nodes', link: '/guide/topology' },
            { text: 'Dashboards', link: '/guide/dashboards' },
            { text: 'Logs & traces', link: '/guide/logs-traces' },
            { text: 'Cost & efficiency', link: '/guide/cost' },
            { text: 'Services (RED & SLO)', link: '/guide/red-slo' },
            { text: 'Events', link: '/guide/events' },
          ],
        },
        {
          text: 'Operate',
          items: [
            { text: 'Alert pack', link: '/guide/alerts' },
            { text: 'Traffic stack profiles', link: '/guide/traffic-profiles' },
            { text: 'Deploy in-cluster', link: '/guide/deploy' },
          ],
        },
      ],
      '/blog/': blogSidebar(),
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/blackcheshire13' }],
    footer: {
      message:
        'ICE and deusex are in active development · <a href="/kubemeridian">KubeMeridian</a> is archived (Apache-2.0) · <a href="/feed.xml">RSS</a>',
      copyright: '© 2026 devopstech · devopstech.net',
    },
    search: { provider: 'local' },
    lastUpdated: { text: 'Updated', formatOptions: { dateStyle: 'long' } },
    editLink: {
      pattern: 'https://github.com/blackcheshire13/kubemeridian/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
  sitemap: { hostname: 'https://devopstech.net' },
});
