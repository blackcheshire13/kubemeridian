import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import HubHome from './components/HubHome.vue';
import IceLoop from './components/IceLoop.vue';
import DeusexCycle from './components/DeusexCycle.vue';
import Flow from './components/Flow.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HubHome', HubHome);
    app.component('IceLoop', IceLoop);
    app.component('DeusexCycle', DeusexCycle);
    app.component('Flow', Flow);
  },
} satisfies Theme;
