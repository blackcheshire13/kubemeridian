import { defineConfig } from 'vitepress';
import { SITE_DESCRIPTION, blogSidebar, checkOgCards, socialHead, writeFeed } from './site-meta';

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
  transformHead: ({ pageData }) => socialHead(pageData),
  buildEnd: ({ outDir }) => {
    checkOgCards();
    writeFeed(outDir);
  },
  themeConfig: {
    logo: '/devopstech.svg',
    siteTitle: 'devopstech',
    nav: [
      { text: 'ICE', link: '/ice/', activeMatch: '^/ice/' },
      { text: 'deusex', link: '/deusex/', activeMatch: '^/deusex/' },
      { text: 'Blog', link: '/blog/', activeMatch: '^/blog/' },
      {
        text: 'KubeMeridian (archived)',
        activeMatch: '^/(kubemeridian|guide/)',
        items: [
          { text: 'Overview', link: '/kubemeridian' },
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'Dashboards', link: '/guide/dashboards' },
          { text: 'Alert pack', link: '/guide/alerts' },
          { text: 'Changelog', link: 'https://github.com/blackcheshire13/kubemeridian/blob/main/CHANGELOG.md' },
        ],
      },
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
      '/ice/': [
        {
          text: 'ICE',
          items: [
            { text: 'Overview', link: '/ice/' },
            { text: 'How ICE is built', link: '/ice/how-it-works' },
          ],
        },
      ],
      '/deusex/': [
        {
          text: 'deusex',
          items: [
            { text: 'Overview', link: '/deusex/' },
            { text: 'The method', link: '/deusex/method' },
          ],
        },
      ],
      '/blog/': blogSidebar(),
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/blackcheshire13' }],
    footer: {
      message: 'ICE and deusex are in active development. KubeMeridian is archived and Apache-2.0 licensed.',
      copyright: '© 2026 devopstech · devopstech.net',
    },
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/blackcheshire13/kubemeridian/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
  sitemap: { hostname: 'https://devopstech.net' },
});
