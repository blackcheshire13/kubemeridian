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
import { ThresholdsMode } from '@grafana/data';
import { PROMETHEUS_ID } from '../constants';

// Absolute-threshold helper: pass [value, color] steps (use -Infinity for the base).
const thr = (steps: Array<[number, string]>) => ({
  mode: ThresholdsMode.Absolute,
  steps: steps.map(([value, color]) => ({ value, color })),
});
import {
  TrafficConfig,
  errorRatioExpr,
  latencyAvgExpr,
  latencyQuantileExpr,
  namespaceVarQuery,
  rateExpr,
  resolveProfile,
  serviceVarQuery,
} from '../traffic/profiles';

const q = (ds: any, expr: string) => new SceneQueryRunner({ datasource: ds, queries: [{ refId: 'A', expr }] });

/**
 * Build a RED & SLO scene driven by the cluster's traffic profile (Istio /
 * nginx / Traefik / Linkerd / Envoy / … / custom). Queries are generated from
 * the resolved profile so the page adapts to the user's stack.
 */
export function buildRedSloScene(opts: { metricsUid: string; traffic?: TrafficConfig }): EmbeddedScene {
  const p = resolveProfile(opts.traffic);
  const ds = { uid: opts.metricsUid, type: PROMETHEUS_ID };

  const variables: any[] = [];
  const nsQuery = namespaceVarQuery(p);
  if (nsQuery) {
    variables.push(
      new QueryVariable({ name: 'namespace', label: 'Namespace', datasource: ds, query: nsQuery, includeAll: false })
    );
  }
  variables.push(
    new QueryVariable({
      name: 'service',
      label: p.namespaceLabel ? 'Service' : 'Service (ns embedded)',
      datasource: ds,
      query: serviceVarQuery(p),
      includeAll: true,
      defaultToAll: true,
      allValue: '.+',
      isMulti: true,
    }),
    new TextBoxVariable({ name: 'slo_target', label: 'SLO target', value: '0.999' })
  );

  const errRatio = errorRatioExpr(p);
  const latencyUnit = p.latencyUnit;

  const topRow = new SceneFlexLayout({
    direction: 'row',
    children: [
      new SceneFlexItem({
        body: PanelBuilders.stat()
          .setTitle('Request rate')
          .setUnit('reqps')
          .setThresholds(thr([[-Infinity, 'green']]))
          .setData(q(ds, rateExpr(p)))
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.stat()
          .setTitle('Error %')
          .setUnit('percent')
          .setThresholds(thr([[-Infinity, 'green'], [1, 'orange'], [5, 'red']]))
          .setData(q(ds, `(${errRatio}) * 100`))
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.stat()
          .setTitle('Availability (SLI)')
          .setUnit('percent')
          .setThresholds(thr([[-Infinity, 'red'], [99, 'orange'], [99.9, 'green']]))
          .setData(q(ds, `(1 - (${errRatio})) * 100`))
          .build(),
      }),
      new SceneFlexItem({
        body: PanelBuilders.gauge()
          .setTitle('Error budget remaining (30d)')
          .setUnit('percent')
          .setMin(0)
          .setMax(100)
          .setThresholds(thr([[-Infinity, 'red'], [20, 'orange'], [50, 'green']]))
          .setData(q(ds, `(1 - ((${errorRatioExpr(p, '30d')}) / (1 - $slo_target))) * 100`))
          .build(),
      }),
    ],
  });

  // Latency panel: percentiles when a histogram exists, else the avg gauge, else a note.
  let latencyItem: SceneFlexItem;
  const p99 = latencyQuantileExpr(p, 0.99);
  if (p99) {
    latencyItem = new SceneFlexItem({
      minHeight: 300,
      body: PanelBuilders.timeseries()
        .setTitle('Latency p50 / p90 / p99')
        .setUnit(latencyUnit)
        .setData(
          new SceneQueryRunner({
            datasource: ds,
            queries: [
              { refId: 'A', expr: latencyQuantileExpr(p, 0.5)!, legendFormat: 'p50' },
              { refId: 'B', expr: latencyQuantileExpr(p, 0.9)!, legendFormat: 'p90' },
              { refId: 'C', expr: p99, legendFormat: 'p99' },
            ],
          })
        )
        .build(),
    });
  } else if (latencyAvgExpr(p)) {
    latencyItem = new SceneFlexItem({
      minHeight: 300,
      body: PanelBuilders.timeseries()
        .setTitle('Average latency (no histogram for this stack)')
        .setUnit(latencyUnit)
        .setData(q(ds, latencyAvgExpr(p)!))
        .build(),
    });
  } else {
    latencyItem = new SceneFlexItem({
      minHeight: 120,
      body: PanelBuilders.text().setTitle('Latency').setOption('content', 'This traffic stack exposes no latency metric.').build(),
    });
  }

  const burnRate = new SceneFlexItem({
    minHeight: 300,
    body: PanelBuilders.timeseries()
      .setTitle('Error-budget burn rate (1h / 6h)')
      .setUnit('short')
      .setDescription('Fast-burn when both windows exceed 14.4×; slow-burn at ~6× (Google SRE multi-window).')
      .setData(
        new SceneQueryRunner({
          datasource: ds,
          queries: [
            { refId: 'A', expr: `(${errorRatioExpr(p, '1h')}) / (1 - $slo_target)`, legendFormat: '1h' },
            { refId: 'B', expr: `(${errorRatioExpr(p, '6h')}) / (1 - $slo_target)`, legendFormat: '6h' },
          ],
        })
      )
      .build(),
  });

  return new EmbeddedScene({
    $variables: new SceneVariableSet({ variables }),
    $timeRange: new SceneTimeRange({ from: 'now-6h', to: 'now' }),
    controls: [new VariableValueSelectors({}), new SceneControlsSpacer(), new SceneTimePicker({}), new SceneRefreshPicker({})],
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({ ySizing: 'content', minHeight: 140, body: topRow }),
        new SceneFlexLayout({ direction: 'row', children: [latencyItem, burnRate] }),
      ],
    }),
  });
}
