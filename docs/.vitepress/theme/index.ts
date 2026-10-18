import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { useRoute, type Theme } from 'vitepress';
import ArchivedNotice from './components/ArchivedNotice.vue';
import HubHome from './components/HubHome.vue';
import IceLoop from './components/IceLoop.vue';
import DeusexCycle from './components/DeusexCycle.vue';
import Flow from './components/Flow.vue';
import PostList from './components/PostList.vue';
import './custom.css';

const isKubeMeridian = (path: string) => path === '/kubemeridian' || path.startsWith('/guide/');

export default {
  extends: DefaultTheme,
  // KubeMeridian is archived: every page of it carries the notice.
  Layout() {
    const route = useRoute();
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () => (isKubeMeridian(route.path) ? h(ArchivedNotice, { wide: true }) : null),
      'doc-before': () => (isKubeMeridian(route.path) ? h(ArchivedNotice) : null),
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
