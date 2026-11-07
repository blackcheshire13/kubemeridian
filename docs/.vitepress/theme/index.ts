// devopstech.net's own theme: VitePress is the engine (markdown, build, router, dark-mode
// state, copy buttons); the layout, navbar, pages and every style are the site's.
import type { Theme } from 'vitepress';
// the site's styles first: a component's own (scoped) rules come later and win a tie
import './styles/base.css';
import './styles/prose.css';
import './styles/site.css';
import Layout from './Layout.vue';
import HubHome from './components/HubHome.vue';
import IceLoop from './components/IceLoop.vue';
import DeusexCycle from './components/DeusexCycle.vue';
import Flow from './components/Flow.vue';
import PostList from './components/PostList.vue';
import PartnerCta from './components/PartnerCta.vue';
import NewsList from './components/NewsList.vue';
import PilotForm from './components/PilotForm.vue';

export default {
  Layout,
  // components used by name inside markdown pages
  enhanceApp({ app }) {
    app.component('HubHome', HubHome);
    app.component('IceLoop', IceLoop);
    app.component('DeusexCycle', DeusexCycle);
    app.component('Flow', Flow);
    app.component('PostList', PostList);
    app.component('PartnerCta', PartnerCta);
    app.component('NewsList', NewsList);
    app.component('PilotForm', PilotForm);
  },
} satisfies Theme;
