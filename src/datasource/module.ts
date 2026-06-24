import { DataSourcePlugin } from '@grafana/data';
import { KubeMeridianDatasource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { KubegrafDSOptions, KubegrafDSQuery } from '../types';

export const plugin = new DataSourcePlugin<KubeMeridianDatasource, KubegrafDSQuery, KubegrafDSOptions>(
  KubeMeridianDatasource
).setConfigEditor(ConfigEditor);
