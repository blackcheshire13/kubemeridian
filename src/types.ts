import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface GlobalSettings {}

// FinOps cost settings for a cluster. When OpenCost/Kubecost is present we read
// real hourly cost metrics; otherwise we estimate from requests x this price list.
export interface CostSettings {
  opencost_present?: boolean;
  cpu_hourly?: number | string; // $ per vCPU-hour
  mem_hourly?: number | string; // $ per GiB-hour
}

export interface KubegrafDSOptions extends DataSourceJsonData {
  // Connections. Datasources are referenced by UID (stable across renames).
  metrics_uid?: string; // Prometheus / Mimir / Thanos
  logs_uid?: string; // Loki
  traces_uid?: string; // Tempo
  cost?: CostSettings;
  /** @deprecated legacy: Prometheus datasource NAME, migrated to metrics_uid on read */
  prometheus_name?: string;

  access_via_token?: boolean;
  tlsSkipVerify?: boolean;
  refresh_pods_rate?: number | string;
  cluster_url?: string;
}

export interface SecureJsonData {
  access_token?: string;
}

export interface KubegrafDSQuery extends DataQuery {}

export interface PromInstance {
  value: string;
  label: string;
  isDefault: boolean | undefined;
}

export enum OrgRole {
  ADMIN = 'Admin',
  EDITOR = 'Editor',
  VIEWER = 'Viewer',
}

export interface User {
  email: string;
  id: number;
  isGrafanaAdmin: boolean;
  isSignedIn: boolean;
  orgId: number;
  orgName: string;
  orgRole: OrgRole;
  lightTheme: boolean;
}

export interface K8sCluster {
  id: number;
  uid: string;
  name: string;
}
