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
import { GraphDrawStyle, StackingMode, ThresholdsMode } from '@grafana/schema';
import { LOKI_ID } from '../constants';
import { LogLevelFilter } from './LogLevelFilter';

export interface LogsSceneOpts {
  /** Loki datasource UID linked to the cluster. */
  logsUid: string;
  /** Fixed namespace (drawer mode). When omitted the scene shows selectors. */
  namespace?: string;
  /** Fixed pod (drawer mode). */
  pod?: string;
}

// Level detection is done at query time on the raw line so it works on plain
// stdout logs AND structured logs, on any Loki version (no detected_level needed).
const ERRWARN_RE = '(?i)(error|warn|fail|fatal|panic|exception|critical)';
const ERR_RE = '(?i)(error|fail|fatal|panic|exception|critical)';
const LEVEL_REGEXP = '(?i)(?P<lvl>error|warn|info|debug|trace|fatal|panic|critical)';
// Fold fatal/panic/critical into "error"; lines with no level word become "unknown".
const LEVEL_FOLD =
  '{{ $x := .lvl | lower }}{{ if or (eq $x "fatal") (eq $x "panic") (eq $x "critical") }}error{{ else if $x }}{{ $x }}{{ else }}unknown{{ end }}';

function selector(o: LogsSceneOpts): string {
  if (o.namespace) {
    const pod = o.pod ? `, pod="${o.pod}"` : '';
    return `{namespace="${o.namespace}"${pod}}`;
  }
  return '{namespace="$namespace", pod=~"$pod"}';
}

// `sum by (level)` volume query — single query, one series per level.
function levelVolume(sel: string, sf: string, range: string): string {
  return `sum by (level)(count_over_time(${sel}${sf} | regexp \`${LEVEL_REGEXP}\` | label_format level=\`${LEVEL_FOLD}\` | __error__="" [${range}]))`;
}

// Apply semantic colours to the per-level series (works on timeseries + piechart).
function levelColors(b: any) {
  const map: Record<string, string> = {
    error: 'red',
    warn: 'orange',
    info: 'green',
    debug: 'blue',
    trace: 'purple',
    unknown: 'gray',
  };
  for (const [name, color] of Object.entries(map)) {
    b.matchFieldsWithName(name).overrideColor({ mode: 'fixed', fixedColor: color });
  }
}

const thresholds = (steps: Array<[number, string]>) => ({
  mode: ThresholdsMode.Absolute,
  steps: steps.map(([value, color]) => ({ value, color })),
});

/**
 * Build a Loki logs scene. In page mode (no fixed namespace) it renders
 * namespace/pod selectors + free-text filter, a stat row (total / errors+warns /
 * error rate / error %), a stacked log-volume-by-level histogram, a level pie +
 * top-pods table, and the logs viewer. In drawer mode it is scoped to one pod
 * and shows only the viewer. The same factory backs both.
 */
export function buildLogsScene(opts: LogsSceneOpts): EmbeddedScene {
  const ds = { uid: opts.logsUid, type: LOKI_ID };
  const pageMode = !opts.namespace;
  const sel = selector(opts);
  // Backtick-delimited LogQL so a search with quotes/backslashes doesn't break it.
  const sf = pageMode ? ' |~ `(?i)$search`' : '';

  const range = (ds2: typeof ds, expr: string, legendFormat?: string) =>
    new SceneQueryRunner({ datasource: ds2, queries: [{ refId: 'A', expr, legendFormat }] });
  const instant = (ds2: typeof ds, expr: string, legendFormat?: string) =>
    new SceneQueryRunner({ datasource: ds2, queries: [{ refId: 'A', expr, queryType: 'instant', legendFormat }] });

  // ---- Logs viewer (both modes) ----
  // Hoisted so the page-mode level filter can re-run it. `logsExpr` keeps the
  // `$namespace`/`$pod`/`$search` tokens so the runner re-interpolates them on every run.
  const LOGS_MAX_LINES = 1000;
  const logsExpr = `${sel}${sf}`;
  const logsQR = new SceneQueryRunner({
    datasource: ds,
    queries: [{ refId: 'A', expr: logsExpr, maxLines: LOGS_MAX_LINES } as any],
  });
  const logsPanel = PanelBuilders.logs()
    .setTitle(opts.pod ? `Logs — ${opts.pod}` : 'Logs')
    .setData(logsQR)
    .setOption('showTime', true)
    .setOption('wrapLogMessage', true)
    .setOption('enableLogDetails', true)
    .setOption('prettifyLogMessage', true)
    .setOption('dedupStrategy', 'signature' as any)
    .setOption('sortOrder', 'Descending' as any)
    .setOption('fontSize', 'small' as any)
    .build();

  if (!pageMode) {
    return new EmbeddedScene({
      $timeRange: new SceneTimeRange({ from: 'now-1h', to: 'now' }),
      controls: [new SceneControlsSpacer(), new SceneTimePicker({}), new SceneRefreshPicker({})],
      body: new SceneFlexLayout({ direction: 'column', children: [new SceneFlexItem({ minHeight: 400, body: logsPanel })] }),
    });
  }

  // ---- Page mode: variables ----
  const variables = new SceneVariableSet({
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
        isMulti: true,
      }),
      new TextBoxVariable({ name: 'search', label: 'Search', value: '' }),
    ],
  });

  // ---- Row A: stat tiles ----
  const statTotal = PanelBuilders.stat()
    .setTitle('Log lines')
    .setUnit('short')
    .setData(instant(ds, `sum(count_over_time(${sel}${sf} [$__range])) or vector(0)`))
    .setOption('graphMode', 'none' as any)
    .build();

  const statErrWarn = PanelBuilders.stat()
    .setTitle('Errors + warnings')
    .setUnit('short')
    .setThresholds(thresholds([[-Infinity, 'green'], [1, 'orange'], [50, 'red']]))
    .setData(instant(ds, `sum(count_over_time(${sel}${sf} |~ \`${ERRWARN_RE}\` [$__range])) or vector(0)`))
    .setOption('graphMode', 'none' as any)
    .build();

  // Loki has no $__rate_interval (Prometheus-only macro) — use $__range as an
  // instant query so the tile reads 0 (via `or vector(0)`) when there are no errors.
  const statErrRate = PanelBuilders.stat()
    .setTitle('Error rate')
    .setUnit('logs/s' as any)
    .setThresholds(thresholds([[-Infinity, 'green'], [0.1, 'orange'], [1, 'red']]))
    .setData(instant(ds, `sum(rate(${sel}${sf} |~ \`${ERR_RE}\` [$__range])) or vector(0)`))
    .setOption('graphMode', 'none' as any)
    .build();

  const statErrPct = PanelBuilders.stat()
    .setTitle('Error %')
    .setUnit('percent')
    .setDecimals(1)
    .setThresholds(thresholds([[-Infinity, 'green'], [5, 'orange'], [20, 'red']]))
    .setData(
      instant(
        ds,
        `100 * (sum(count_over_time(${sel}${sf} |~ \`${ERR_RE}\` [$__range])) or vector(0)) / sum(count_over_time(${sel}${sf} [$__range]))`
      )
    )
    .setOption('graphMode', 'none' as any)
    .build();

  const statRow = new SceneFlexLayout({
    direction: 'row',
    children: [statTotal, statErrWarn, statErrRate, statErrPct].map((p) => new SceneFlexItem({ body: p })),
  });

  // ---- Row B: stacked log-volume-by-level histogram ----
  const volumePanel = PanelBuilders.timeseries()
    .setTitle('Log volume by level')
    .setData(range(ds, levelVolume(sel, sf, '$__auto'), '{{level}}'))
    .setCustomFieldConfig('drawStyle', GraphDrawStyle.Bars)
    .setCustomFieldConfig('fillOpacity', 70)
    .setCustomFieldConfig('lineWidth', 0)
    .setCustomFieldConfig('stacking', { mode: StackingMode.Normal, group: 'A' })
    .setOverrides(levelColors)
    .build();

  // ---- Row C: level pie + top pods ----
  const levelPie = PanelBuilders.piechart()
    .setTitle('Levels')
    .setData(instant(ds, levelVolume(sel, sf, '$__range'), '{{level}}'))
    .setOverrides(levelColors)
    .build();

  const topPods = PanelBuilders.table()
    .setTitle('Top pods by volume')
    .setData(instant(ds, `topk(15, sum by (pod)(count_over_time(${sel}${sf} [$__range])))`))
    .build();

  const distRow = new SceneFlexLayout({
    direction: 'row',
    children: [
      new SceneFlexItem({ width: '34%', body: levelPie }),
      new SceneFlexItem({ body: topPods }),
    ],
  });

  // Level filter for the log viewer only — reuses the same line regexes as the
  // stat tiles. Appended as an extra `|~` so it ANDs with the free-text $search.
  const levelFilter = new LogLevelFilter({
    value: '',
    baseExpr: logsExpr,
    maxLines: LOGS_MAX_LINES,
    queryRunner: logsQR,
    options: [
      { label: 'All', value: '' },
      { label: 'Errors', value: ` |~ \`${ERR_RE}\`` },
      { label: 'Errors + warnings', value: ` |~ \`${ERRWARN_RE}\`` },
    ],
  });

  return new EmbeddedScene({
    $variables: variables,
    $timeRange: new SceneTimeRange({ from: 'now-1h', to: 'now' }),
    controls: [
      new VariableValueSelectors({}),
      levelFilter,
      new SceneControlsSpacer(),
      new SceneTimePicker({}),
      new SceneRefreshPicker({}),
    ],
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({ ySizing: 'content', minHeight: 110, body: statRow }),
        new SceneFlexItem({ ySizing: 'content', minHeight: 200, body: volumePanel }),
        new SceneFlexItem({ ySizing: 'content', minHeight: 280, body: distRow }),
        new SceneFlexItem({ minHeight: 420, body: logsPanel }),
      ],
    }),
  });
}
