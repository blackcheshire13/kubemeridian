import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Icon, Stack, Tooltip, useStyles2, useTheme2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { Node } from '../models/Node';
import { Pod } from '../models/Pod';
import { parseCpu, parseMemory, formatCpu, formatMemory, percent } from '../common/resources';
import { PLUGIN_BASE_URL, ROUTES } from '../constants';

interface Props {
  node: Node;
  pods: Pod[];
  clusterUid?: string;
}

function statusColor(theme: GrafanaTheme2, color: string): string {
  switch (color) {
    case 'error':
      return theme.colors.error.main;
    case 'warning':
      return theme.colors.warning.main;
    case 'terminating':
      return theme.colors.text.disabled;
    case 'succeeded':
      return theme.colors.info.main;
    default:
      return theme.colors.success.main;
  }
}

function barColor(theme: GrafanaTheme2, pct: number): string {
  if (pct >= 90) {
    return theme.colors.error.main;
  }
  if (pct >= 70) {
    return theme.colors.warning.main;
  }
  return theme.colors.success.main;
}

function Bar({ label, used, total, text }: { label: string; used: number; total: number; text: string }) {
  const s = useStyles2(getStyles);
  const theme = useTheme2();
  const pct = percent(used, total);
  return (
    <div className={s.metric}>
      <div className={s.metricHead}>
        <span>{label}</span>
        <span>
          {text} <span className={s.dim}>({pct}%)</span>
        </span>
      </div>
      <div className={s.track}>
        <div className={s.fill} style={{ width: `${pct}%`, backgroundColor: barColor(theme, pct) }} />
      </div>
    </div>
  );
}

export function NodeStatusCard({ node, pods, clusterUid }: Props) {
  const s = useStyles2(getStyles);
  const theme = useTheme2();
  const alloc = node.allocatable;

  let reqCpu = 0;
  let reqMem = 0;
  pods.forEach((p) => {
    (p.data.spec?.containers || []).forEach((c: any) => {
      reqCpu += parseCpu(c.resources?.requests?.cpu);
      reqMem += parseMemory(c.resources?.requests?.memory);
    });
  });

  const counts = pods.reduce<Record<string, number>>((acc, p) => {
    acc[p.color] = (acc[p.color] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={s.card}>
      <div className={s.header}>
        <Stack direction="row" alignItems="center" gap={1} wrap="wrap">
          <Icon name="cube" />
          <span className={s.name}>{node.name}</span>
          <Badge text={node.ready ? 'Ready' : 'NotReady'} color={node.ready ? 'green' : 'red'} />
          {node.roles.map((r) => (
            <Badge key={r} text={r} color="blue" />
          ))}
          {node.pressures.map((p) => (
            <Badge key={p} text={p} color="orange" icon="exclamation-triangle" />
          ))}
        </Stack>
        <span className={s.dim}>{node.info.kubelet}</span>
      </div>

      <div className={s.metrics}>
        <Bar label="CPU req" used={reqCpu} total={alloc.cpu} text={`${formatCpu(reqCpu)} / ${formatCpu(alloc.cpu)}`} />
        <Bar
          label="Memory req"
          used={reqMem}
          total={alloc.memory}
          text={`${formatMemory(reqMem)} / ${formatMemory(alloc.memory)}`}
        />
        <Bar label="Pods" used={pods.length} total={alloc.pods} text={`${pods.length} / ${alloc.pods}`} />
      </div>

      <div className={s.podsHead}>
        <span>Pods ({pods.length})</span>
        <span className={s.legend}>
          {Object.entries(counts).map(([color, n]) => (
            <span key={color} className={s.legendItem}>
              <span className={s.dot} style={{ backgroundColor: statusColor(theme, color) }} />
              {n}
            </span>
          ))}
        </span>
      </div>

      <div className={s.podGrid}>
        {pods.map((p) => {
          const href = clusterUid
            ? `${PLUGIN_BASE_URL}/${ROUTES.ApplicationsOverview}/${clusterUid}`
            : undefined;
          const sq = (
            <span
              className={s.pod}
              style={{ backgroundColor: statusColor(theme, p.color) }}
              data-testid="node-pod-square"
            />
          );
          return (
            <Tooltip key={p.data.metadata.namespace + '/' + p.name} content={`${p.data.metadata.namespace}/${p.name} — ${p.message}`}>
              {href ? (
                <a href={href}>{sq}</a>
              ) : (
                sq
              )}
            </Tooltip>
          );
        })}
        {pods.length === 0 && <span className={s.dim}>no pods</span>}
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  card: css({
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.weak}`,
    borderRadius: theme.shape.radius.default,
    padding: theme.spacing(2),
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
  }),
  name: css({ fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.fontWeightMedium }),
  dim: css({ color: theme.colors.text.secondary, fontSize: theme.typography.bodySmall.fontSize }),
  metrics: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
  }),
  metric: css({ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) }),
  metricHead: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
  }),
  track: css({ width: '100%', height: 5, borderRadius: 3, background: theme.colors.background.canvas, overflow: 'hidden' }),
  fill: css({ height: '100%', borderRadius: 3 }),
  podsHead: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing(0.5),
  }),
  legend: css({ display: 'flex', gap: theme.spacing(1.5) }),
  legendItem: css({ display: 'inline-flex', alignItems: 'center', gap: theme.spacing(0.5) }),
  dot: css({ display: 'inline-block', width: 8, height: 8, borderRadius: 2 }),
  podGrid: css({ display: 'flex', flexWrap: 'wrap', gap: 3 }),
  pod: css({
    display: 'block',
    width: 12,
    height: 12,
    borderRadius: 2,
    cursor: 'pointer',
    '&:hover': { outline: `1px solid ${theme.colors.text.primary}` },
  }),
});
