import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Icon, LinkButton, Stack, useStyles2, useTheme2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { Node } from '../models/Node';
import { formatCpu, formatMemory, percent } from '../common/resources';

interface Props {
  node: Node;
  podCount: number;
  reqCpu: number; // millicores
  reqMem: number; // bytes
  dashboardUid?: string;
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

function ResourceBar({ label, used, total, text }: { label: string; used: number; total: number; text: string }) {
  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const pct = percent(used, total);
  return (
    <div className={styles.metric}>
      <div className={styles.metricHead}>
        <span>{label}</span>
        <span className={styles.metricValue}>
          {text} <span className={styles.pct}>({pct}%)</span>
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%`, backgroundColor: barColor(theme, pct) }} />
      </div>
    </div>
  );
}

export function NodeCard({ node, podCount, reqCpu, reqMem, dashboardUid }: Props) {
  const styles = useStyles2(getStyles);
  const alloc = node.allocatable;
  const info = node.info;
  const pressures = node.pressures;

  // The node dashboard is keyed on the node name; cluster defaults to All
  // (its $cluster is a Prometheus label, unrelated to this datasource's name).
  const dashLink = dashboardUid && `/d/${dashboardUid}/node?var-node=${encodeURIComponent(node.name)}`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Stack direction="row" alignItems="center" gap={1} wrap="wrap">
          <Icon name="cube" />
          <span className={styles.name}>{node.name}</span>
          <Badge text={node.ready ? 'Ready' : 'NotReady'} color={node.ready ? 'green' : 'red'} />
          {node.roles.map((r) => (
            <Badge key={r} text={r} color="blue" />
          ))}
          {pressures.map((p) => (
            <Badge key={p} text={p} color="orange" icon="exclamation-triangle" />
          ))}
        </Stack>
        {dashLink && (
          <LinkButton size="sm" variant="secondary" icon="apps" href={dashLink}>
            Node dashboard
          </LinkButton>
        )}
      </div>

      <div className={styles.metrics}>
        <ResourceBar
          label="CPU requests"
          used={reqCpu}
          total={alloc.cpu}
          text={`${formatCpu(reqCpu)} / ${formatCpu(alloc.cpu)}`}
        />
        <ResourceBar
          label="Memory requests"
          used={reqMem}
          total={alloc.memory}
          text={`${formatMemory(reqMem)} / ${formatMemory(alloc.memory)}`}
        />
        <ResourceBar label="Pods" used={podCount} total={alloc.pods} text={`${podCount} / ${alloc.pods}`} />
      </div>

      <div className={styles.meta}>
        {[info.kubelet, info.os, info.runtime, info.arch, node.internalIP].filter(Boolean).join('  ·  ')}
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
    marginBottom: theme.spacing(1),
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  }),
  name: css({ fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.fontWeightMedium }),
  metrics: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: theme.spacing(2),
  }),
  metric: css({ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) }),
  metricHead: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
  }),
  metricValue: css({ color: theme.colors.text.primary }),
  pct: css({ color: theme.colors.text.secondary }),
  track: css({
    width: '100%',
    height: 6,
    borderRadius: 3,
    background: theme.colors.background.canvas,
    overflow: 'hidden',
  }),
  fill: css({ height: '100%', borderRadius: 3, transition: 'width 0.3s ease' }),
  meta: css({
    marginTop: theme.spacing(1.5),
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.text.secondary,
  }),
});
