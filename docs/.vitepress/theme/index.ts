import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { useData, type Theme } from 'vitepress';
import ArchivedNotice from './components/ArchivedNotice.vue';
import { isKubeMeridianPage } from '../kubemeridian.mjs';
import HubHome from './components/HubHome.vue';
import IceLoop from './components/IceLoop.vue';
import DeusexCycle from './components/DeusexCycle.vue';
import Flow from './components/Flow.vue';
import PostList from './components/PostList.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  // KubeMeridian is archived: every page of it carries the notice.
  Layout() {
    const { page } = useData();
    const archived = () => isKubeMeridianPage(page.value.relativePath);
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => (archived() ? h(ArchivedNotice, { wide: true }) : null),
      'doc-before': () => (archived() ? h(ArchivedNotice) : null),
    });
  },
  enhanceApp({ app }) {
    app.component('HubHome', HubHome);
    app.component('IceLoop', IceLoop);
    app.component('DeusexCycle', DeusexCycle);
    app.component('Flow', Flow);
    app.component('PostList', PostList);
  },
} satisfies Theme;
