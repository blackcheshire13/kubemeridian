import { DataSourcePlugin } from '@grafana/data';
import { KubeGrafDatasource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { KubegrafDSOptions, KubegrafDSQuery } from '../types';

export const plugin = new DataSourcePlugin<KubeGrafDatasource, KubegrafDSQuery, KubegrafDSOptions>(
  KubeGrafDatasource
).setConfigEditor(ConfigEditor);
