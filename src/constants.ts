import pluginJson from './plugin.json';

export const APP_ID = pluginJson.id;
export const PLUGIN_BASE_URL = `/a/${APP_ID}`;

// Bundled datasource plugin id (see src/datasource/plugin.json)
export const DS_ID = 'starcrown-kubegraf-datasource';
export const PROMETHEUS_ID = 'prometheus';

// App page routes (path-based, react-router v6)
export enum ROUTES {
  Clusters = 'clusters',
  ClusterStatus = 'cluster-status',
  ApplicationsOverview = 'applications-overview',
  NodesOverview = 'nodes-overview',
}

export const PODS_LIMIT = 10;

export const ERROR = 3;
export const WARNING = 2;
export const TERMINATING = 1;
export const SUCCESS = 0;
export const SUCCEEDED = 4;

export const COLOR_YELLOW = '#ffff0096';
export const COLOR_RED = '#a52a2a';
export const COLOR_GREEN = '#299c46';
