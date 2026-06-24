import { getDataSourceSrv } from '@grafana/runtime';
import { KubegrafDSOptions } from '../types';
import { LOKI_ID, PROMETHEUS_ID, TEMPO_ID } from '../constants';

export interface DsOption {
  uid: string;
  name: string;
}

/** List configured datasources of a given plugin type as {uid, name}. */
export function listDatasources(type: string): DsOption[] {
  return getDataSourceSrv()
    .getList({ type })
    .map((ds) => ({ uid: ds.uid, name: ds.name }));
}

export const listMetricsDatasources = () => listDatasources(PROMETHEUS_ID);
export const listLogsDatasources = () => listDatasources(LOKI_ID);
export const listTracesDatasources = () => listDatasources(TEMPO_ID);

/**
 * Resolve the metrics datasource UID, migrating the legacy `prometheus_name`
 * (which stored a datasource NAME) to a UID. Pure — takes the candidate list so
 * it can be unit-tested without the runtime datasource service.
 */
export function migrateMetricsUid(jsonData: KubegrafDSOptions | undefined, promList: DsOption[]): string | undefined {
  if (!jsonData) {
    return undefined;
  }
  if (jsonData.metrics_uid) {
    return jsonData.metrics_uid;
  }
  if (jsonData.prometheus_name) {
    return promList.find((d) => d.name === jsonData.prometheus_name)?.uid;
  }
  return undefined;
}

/** Runtime wrapper around {@link migrateMetricsUid}. */
export function resolveMetricsUid(jsonData: KubegrafDSOptions | undefined): string | undefined {
  return migrateMetricsUid(jsonData, listMetricsDatasources());
}
