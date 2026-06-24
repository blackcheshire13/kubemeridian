import {
  EmbeddedScene,
  PanelBuilders,
  QueryVariable,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  TextBoxVariable,
  VariableValueSelectors,
} from '@grafana/scenes';
import { LOKI_ID } from '../constants';

export interface LogsSceneOpts {
  /** Loki datasource UID linked to the cluster. */
  logsUid: string;
  /** Fixed namespace (drawer mode). When omitted the scene shows selectors. */
  namespace?: string;
  /** Fixed pod (drawer mode). */
  pod?: string;
}

const ERROR_RE = '(?i)(error|warn|fail|exception|panic|fatal)';

function selector(o: LogsSceneOpts): string {
  if (o.namespace) {
    const pod = o.pod ? `, pod="${o.pod}"` : '';
    return `{namespace="${o.namespace}"${pod}}`;
  }
  return '{namespace="$namespace", pod=~"$pod"}';
}

/**
 * Build a Loki logs scene. In page mode (no fixed namespace) it renders
 * namespace/pod selectors + a free-text filter; in drawer mode it is scoped to
 * one pod. The same factory backs both the Logs page and the inline pod drawer.
 */
export function buildLogsScene(opts: LogsSceneOpts): EmbeddedScene {
  const ds = { uid: opts.logsUid, type: LOKI_ID };
  const pageMode = !opts.namespace;
  const sel = selector(opts);
  const logExpr = pageMode ? `${sel} |~ "(?i)$search"` : sel;

  const variables = pageMode
    ? new SceneVariableSet({
        variables: [
          new QueryVariable({
            name: 'namespace',
            label: 'Namespace',
            datasource: ds,
            query: 'label_values(namespace)',
            includeAll: false,
          }),
          new QueryVariable({
            name: 'pod',
            label: 'Pod',
            datasource: ds,
            query: 'label_values({namespace="$namespace"}, pod)',
            includeAll: true,
            defaultToAll: true,
            allValue: '.+',
            isMulti: false,
          }),
          new TextBoxVariable({ name: 'search', label: 'Search', value: '' }),
        ],
      })
    : undefined;

  const logsPanel = PanelBuilders.logs()
    .setTitle(opts.pod ? `Logs — ${opts.pod}` : 'Logs')
    .setData(new SceneQueryRunner({ datasource: ds, queries: [{ refId: 'A', expr: logExpr }] }))
    .setOption('showTime', true)
    .setOption('wrapLogMessage', true)
    .setOption('enableLogDetails', true)
    .setOption('sortOrder', 'Descending' as any)
    .build();

  const errorRatePanel = PanelBuilders.timeseries()
    .setTitle('Error/warn log rate')
    .setData(
      new SceneQueryRunner({
        datasource: ds,
        queries: [{ refId: 'A', expr: `sum(rate(${sel} |~ "${ERROR_RE}" [$__auto]))` }],
      })
    )
    .setUnit('logs/s' as any)
    .setCustomFieldConfig('fillOpacity', 20)
    .build();

  const controls = pageMode
    ? [new VariableValueSelectors({}), new SceneControlsSpacer(), new SceneTimePicker({}), new SceneRefreshPicker({})]
    : [new SceneControlsSpacer(), new SceneTimePicker({}), new SceneRefreshPicker({})];

  return new EmbeddedScene({
    $variables: variables,
    $timeRange: new SceneTimeRange({ from: 'now-1h', to: 'now' }),
    controls,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({ ySizing: 'content', minHeight: 160, body: errorRatePanel }),
        new SceneFlexItem({ minHeight: 400, body: logsPanel }),
      ],
    }),
  });
}
