import { defineConfig } from 'vitepress';

// devopstech.net — engineering hub: ICE, deusex, KubeMeridian (docs), blog
export default defineConfig({
  lang: 'en-US',
  title: 'devopstech',
  description:
    'An engineering workshop: active defence for Kubernetes (ICE), an autonomous development loop (deusex), and open-source observability (KubeMeridian).',
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
    ['meta', { property: 'og:title', content: 'devopstech — production engineering, closed loop' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'ICE (active defence for Kubernetes), deusex (autonomous development loop) and KubeMeridian (Kubernetes observability for Grafana).',
      },
    ],
  ],
  themeConfig: {
    logo: '/devopstech.svg',
    siteTitle: 'devopstech',
    nav: [
      { text: 'ICE', link: '/ice/', activeMatch: '^/ice/' },
      { text: 'deusex', link: '/deusex/', activeMatch: '^/deusex/' },
      {
        text: 'KubeMeridian',
        activeMatch: '^/(kubemeridian|guide/)',
        items: [
          { text: 'Overview', link: '/kubemeridian' },
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'Dashboards', link: '/guide/dashboards' },
          { text: 'Alert pack', link: '/guide/alerts' },
          { text: 'Changelog', link: 'https://github.com/blackcheshire13/kubemeridian/blob/main/CHANGELOG.md' },
        ],
      },
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
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'All posts', link: '/blog/' },
            { text: 'The bottleneck is the human', link: '/blog/the-bottleneck-is-the-human' },
            { text: 'Merged is not fixed', link: '/blog/merged-is-not-fixed' },
            { text: 'Clusters → hub-and-spoke ArgoCD', link: '/blog/consolidating-kubernetes-clusters' },
            { text: 'Vault HA on Kubernetes', link: '/blog/vault-ha-on-kubernetes' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/blackcheshire13' }],
    footer: {
      message: 'KubeMeridian is Apache-2.0 licensed. ICE and deusex are in active development.',
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
