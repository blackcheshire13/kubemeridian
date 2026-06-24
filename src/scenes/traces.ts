import {
  EmbeddedScene,
  PanelBuilders,
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
import { TEMPO_ID } from '../constants';

export interface TracesSceneOpts {
  /** Tempo datasource UID linked to the cluster. */
  tracesUid: string;
}

/** Build a Tempo traces scene: a TraceQL search list + a service graph. */
export function buildTracesScene(opts: TracesSceneOpts): EmbeddedScene {
  const ds = { uid: opts.tracesUid, type: TEMPO_ID };

  const tracesPanel = PanelBuilders.traces()
    .setTitle('Traces')
    .setData(
      new SceneQueryRunner({
        datasource: ds,
        queries: [{ refId: 'A', queryType: 'traceql', query: '$traceql', limit: 50, tableType: 'traces' }],
      })
    )
    .build();

  const serviceGraph = PanelBuilders.nodegraph()
    .setTitle('Service graph')
    .setData(new SceneQueryRunner({ datasource: ds, queries: [{ refId: 'A', queryType: 'serviceMap' }] }))
    .build();

  return new EmbeddedScene({
    $variables: new SceneVariableSet({
      variables: [new TextBoxVariable({ name: 'traceql', label: 'TraceQL', value: '{}' })],
    }),
    $timeRange: new SceneTimeRange({ from: 'now-1h', to: 'now' }),
    controls: [new VariableValueSelectors({}), new SceneControlsSpacer(), new SceneTimePicker({}), new SceneRefreshPicker({})],
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({ minHeight: 420, body: tracesPanel }),
        new SceneFlexItem({ minHeight: 300, body: serviceGraph }),
      ],
    }),
  });
}
