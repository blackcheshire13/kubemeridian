import { defineConfig } from 'vitepress';

// KubeMeridian documentation — devopstech.net
export default defineConfig({
  lang: 'en-US',
  title: 'KubeMeridian',
  description: 'Turnkey Kubernetes observability for Grafana — metrics, logs, traces, cost and SLOs from one plugin.',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#326CE5' }],
    ['meta', { property: 'og:title', content: 'KubeMeridian — Kubernetes observability for Grafana' }],
    ['meta', { property: 'og:description', content: 'Install one plugin, link your connections, get the whole base monitoring stack.' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'KubeMeridian',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Dashboards', link: '/guide/dashboards' },
      { text: 'Alerts', link: '/guide/alerts' },
      { text: 'Blog', link: '/blog/' },
      { text: 'About', link: '/about' },
      {
        text: 'v2.3',
        items: [
          { text: 'Changelog', link: 'https://github.com/blackcheshire13/kubemeridian/blob/main/CHANGELOG.md' },
          { text: 'Grafana catalog', link: 'https://grafana.com/grafana/plugins/' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
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
      '/blog/': [
        {
          text: 'Blog',
          items: [
            { text: 'All posts', link: '/blog/' },
            { text: 'Clusters → hub-and-spoke ArgoCD', link: '/blog/consolidating-kubernetes-clusters' },
            { text: 'Vault HA on Kubernetes', link: '/blog/vault-ha-on-kubernetes' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/blackcheshire13/kubemeridian' }],
    footer: {
      message: 'Apache-2.0 licensed.',
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
