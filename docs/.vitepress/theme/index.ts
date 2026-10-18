import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { useData, type Theme } from 'vitepress';
import HubHome from './components/HubHome.vue';
import IceLoop from './components/IceLoop.vue';
import DeusexCycle from './components/DeusexCycle.vue';
import Flow from './components/Flow.vue';
import PostList from './components/PostList.vue';
import PartnerCta from './components/PartnerCta.vue';
import NavCta from './components/NavCta.vue';
import SectionNav from './components/SectionNav.vue';
import NotFound from './components/NotFound.vue';
import ArchivedNotice from './components/ArchivedNotice.vue';
import { isKubeMeridianPage } from '../kubemeridian.mjs';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout() {
    const { page } = useData();
    const rel = () => page.value.relativePath;
    const product = () => (rel().startsWith('ice/') ? 'ice' : rel().startsWith('deusex/') ? 'deusex' : null);
    return h(DefaultTheme.Layout, null, {
      // one call to action, always reachable
      'nav-bar-content-after': () => h(NavCta),
      'nav-screen-content-before': () => h(NavCta, { screen: true }),
      'aside-outline-after': () =>
        product()
          ? h(PartnerCta, {
              topic: product(),
              variant: 'aside',
              lead:
                product() === 'ice'
                  ? 'Run the loop on your cluster before the public release.'
                  : 'See it run on a codebase of yours.',
            })
          : null,
      // product pages navigate with tabs; KubeMeridian is archived
      'doc-before': () => (isKubeMeridianPage(rel()) ? h(ArchivedNotice) : h(SectionNav)),
      'home-hero-before': () => (isKubeMeridianPage(rel()) ? h(ArchivedNotice, { wide: true }) : null),
      'not-found': () => h(NotFound),
    });
  },
  enhanceApp({ app }) {
    app.component('HubHome', HubHome);
    app.component('IceLoop', IceLoop);
    app.component('DeusexCycle', DeusexCycle);
    app.component('Flow', Flow);
    app.component('PostList', PostList);
    app.component('PartnerCta', PartnerCta);
  },
} satisfies Theme;
