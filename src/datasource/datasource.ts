import {
  AppEvents,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MetricFindValue,
  TestDataSourceResponse,
} from '@grafana/data';
import { getAppEvents, getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';
import { KubegrafDSOptions, KubegrafDSQuery } from '../types';

function alertError(message: string) {
  getAppEvents().publish({ type: AppEvents.alertError.name, payload: [message] });
}

export class KubeGrafDatasource extends DataSourceApi<KubegrafDSQuery, KubegrafDSOptions> {
  constructor(public instanceSettings: DataSourceInstanceSettings<KubegrafDSOptions>) {
    super(instanceSettings);
  }

  // The datasource is used as a thin proxy to the Kubernetes API; it does not
  // back panel queries directly, so query() returns an empty frame set.
  async query(_request: DataQueryRequest<KubegrafDSQuery>): Promise<DataQueryResponse> {
    return { data: [] };
  }

  // Powers dashboard template variables (e.g. the bundled dashboards' $node /
  // $nodeHost / $namespace) by resolving names from the Kubernetes API.
  async metricFindQuery(query: string): Promise<MetricFindValue[]> {
    const q = (query || '').trim();

    // "nodeHost <node-name>" -> the node's InternalIP (node-exporter instance label)
    if (/^nodeHost\b/i.test(q)) {
      const name = q.replace(/^nodeHost\s*/i, '').trim();
      const nodes = await this.getNodes();
      const node = nodes.find((n: any) => n.metadata?.name === name);
      const addresses = node?.status?.addresses || [];
      const addr = addresses.find((a: any) => a.type === 'InternalIP') || addresses[0];
      return addr ? [{ text: addr.address }] : [];
    }
    if (/^nodes?$/i.test(q)) {
      return (await this.getNodes()).map((n: any) => ({ text: n.metadata?.name })).filter((v) => v.text);
    }
    if (/^namespaces?$/i.test(q)) {
      return (await this.getNamespaces()).map((n: any) => ({ text: n.metadata?.name })).filter((v) => v.text);
    }
    if (/^pods?$/i.test(q)) {
      return (await this.getPods()).map((p: any) => ({ text: p.metadata?.name })).filter((v) => v.text);
    }
    return [];
  }

  async testDatasource(): Promise<TestDataSourceResponse> {
    try {
      const res: any = await lastValueFrom(this.__get('/api/v1/namespaces'));
      if (res.status !== 200) {
        return { status: 'error', message: res?.data?.message ?? 'Request failed' };
      }
      return { status: 'success', message: 'Datasource is working' };
    } catch (err: any) {
      return { status: 'error', message: err?.data?.message ?? err?.statusText ?? 'Connection failed' };
    }
  }

  private async __list(url: string, label: string): Promise<any[]> {
    try {
      const res: any = await lastValueFrom(this.__get(url));
      if (!res?.data?.items) {
        alertError(`${label} not received`);
        return [];
      }
      return res.data.items;
    } catch (e) {
      console.error(e);
      alertError(`${label} not received`);
      return [];
    }
  }

  getNamespaces() {
    return this.__list('/api/v1/namespaces', 'Namespaces');
  }

  getComponents() {
    return this.__list('/api/v1/componentstatuses', 'Component statuses');
  }

  getNodes() {
    return this.__list('/api/v1/nodes', 'Nodes');
  }

  getDeployments(namespace: string | null = null) {
    return this.__list('/apis/apps/v1/' + this.__addNamespace(namespace) + 'deployments', 'Deployments');
  }

  getStatefulsets(namespace: string | null = null) {
    return this.__list('/apis/apps/v1/' + this.__addNamespace(namespace) + 'statefulsets', 'Statefulsets');
  }

  getDaemonsets(namespace: string | null = null) {
    return this.__list('/apis/apps/v1/' + this.__addNamespace(namespace) + 'daemonsets', 'Daemonsets');
  }

  getJobs() {
    return this.__list('/apis/batch/v1/jobs', 'Jobs');
  }

  // batch/v1beta1 CronJobs were removed in Kubernetes 1.25; use the stable batch/v1.
  getCronjobs() {
    return this.__list('/apis/batch/v1/cronjobs', 'CronJobs');
  }

  getServices(namespace: string | null = null) {
    return this.__list('/api/v1/' + this.__addNamespace(namespace) + 'services', 'Services');
  }

  getPods(namespace: string | null = null) {
    return this.__list('/api/v1/' + this.__addNamespace(namespace) + 'pods', 'Pods');
  }

  getEvents(namespace: string | null = null) {
    return this.__list('/api/v1/' + this.__addNamespace(namespace) + 'events', 'Events');
  }

  getResourceQuotas(namespace: string | null = null) {
    return this.__list('/api/v1/' + this.__addNamespace(namespace) + 'resourcequotas', 'Resource quotas');
  }

  getPersistentVolumeClaims(namespace: string | null = null) {
    return this.__list('/api/v1/' + this.__addNamespace(namespace) + 'persistentvolumeclaims', 'Persistent volume claims');
  }

  getPersistentVolumes() {
    return this.__list('/api/v1/persistentvolumes', 'Persistent volumes');
  }

  getStorageClasses() {
    return this.__list('/apis/storage.k8s.io/v1/storageclasses', 'Storage classes');
  }

  getIngresses(namespace: string | null = null) {
    return this.__list('/apis/networking.k8s.io/v1/' + this.__addNamespace(namespace) + 'ingresses', 'Ingresses');
  }

  getHorizontalPodAutoscalers(namespace: string | null = null) {
    return this.__list(
      '/apis/autoscaling/v2/' + this.__addNamespace(namespace) + 'horizontalpodautoscalers',
      'Horizontal pod autoscalers'
    );
  }

  __addNamespace(namespace: string | undefined | null) {
    return namespace ? `namespaces/${namespace}/` : '';
  }

  __get(url: string) {
    let _url = '' + this.instanceSettings.url;
    if (this.instanceSettings.jsonData.access_via_token) {
      _url += '/__proxy';
    }
    _url += url;

    return getBackendSrv().fetch({
      url: _url,
      method: 'GET',
    });
  }
}
