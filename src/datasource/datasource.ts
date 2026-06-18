import {
  AppEvents,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
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
