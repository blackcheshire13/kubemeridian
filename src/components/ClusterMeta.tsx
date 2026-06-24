import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { Badge, Icon, Tooltip, useStyles2 } from '@grafana/ui';
import { KubeGrafDatasource } from '../datasource/datasource';
import { Node } from '../models/Node';
import { KubegrafDSOptions } from '../types';
import { resolveMetricsUid } from '../common/connections';
import { isProfileComplete, resolveProfile } from '../traffic/profiles';

interface Health {
  nodesReady: number;
  nodesTotal: number;
  pods: number;
  namespaces: number;
}

interface Conn {
  metrics: boolean;
  logs: boolean;
  traces: boolean;
  profileLabel: string;
  profileReady: boolean;
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrap: css({ display: 'flex', flexDirection: 'column', gap: theme.spacing(1), marginTop: theme.spacing(0.5) }),
  row: css({ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap', alignItems: 'center' }),
  stat: css({ color: theme.colors.text.secondary, fontSize: theme.typography.bodySmall.fontSize }),
  strong: css({ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeightMedium }),
});

/** Fleet health (nodes/pods/namespaces from the k8s API) + a connection checklist
 *  (which of metrics/logs/traces/RED-profile are configured) for one cluster. */
export function ClusterMeta({ uid }: { uid: string }) {
  const styles = useStyles2(getStyles);
  const [health, setHealth] = useState<Health | null>(null);
  const [conn, setConn] = useState<Conn | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ds = (await getDataSourceSrv().get(uid)) as KubeGrafDatasource;
        const jsonData = (ds.instanceSettings.jsonData ?? {}) as KubegrafDSOptions;
        const profile = resolveProfile(jsonData.traffic);
        if (mounted) {
          setConn({
            metrics: Boolean(resolveMetricsUid(jsonData)),
            logs: Boolean(jsonData.logs_uid),
            traces: Boolean(jsonData.traces_uid),
            profileLabel: profile.label,
            profileReady: isProfileComplete(profile),
          });
        }
        const [nodes, pods, namespaces] = await Promise.all([ds.getNodes(), ds.getPods(), ds.getNamespaces()]);
        if (!mounted) {
          return;
        }
        const nodeModels = (Array.isArray(nodes) ? nodes : []).map((n: any) => new Node(n));
        setHealth({
          nodesReady: nodeModels.filter((n) => n.ready).length,
          nodesTotal: nodeModels.length,
          pods: Array.isArray(pods) ? pods.length : 0,
          namespaces: Array.isArray(namespaces) ? namespaces.length : 0,
        });
      } catch {
        if (mounted) {
          setError(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uid]);

  const chip = (ok: boolean, label: string, tip: string) => (
    <Tooltip content={tip}>
      <Badge text={label} icon={ok ? 'check' : 'times'} color={ok ? 'green' : 'orange'} />
    </Tooltip>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {error && <span className={styles.stat}>Cluster API unreachable</span>}
        {!error && !health && <span className={styles.stat}>Loading cluster health…</span>}
        {health && (
          <span className={styles.stat}>
            <Icon name="heart" />{' '}
            <span className={health.nodesReady === health.nodesTotal ? styles.strong : undefined}>
              {health.nodesReady}/{health.nodesTotal}
            </span>{' '}
            nodes ready · <span className={styles.strong}>{health.pods}</span> pods ·{' '}
            <span className={styles.strong}>{health.namespaces}</span> namespaces
          </span>
        )}
      </div>
      {conn && (
        <div className={styles.row}>
          {chip(true, 'K8s API', 'Kubernetes API connection')}
          {chip(conn.metrics, 'Metrics', conn.metrics ? 'Prometheus linked' : 'No Prometheus linked — dashboards will be empty')}
          {chip(conn.logs, 'Logs', conn.logs ? 'Loki linked' : 'No Loki linked — the Logs tab is disabled')}
          {chip(conn.traces, 'Traces', conn.traces ? 'Tempo linked' : 'No Tempo linked — the Traces tab is disabled')}
          {chip(conn.profileReady, `RED: ${conn.profileLabel}`, conn.profileReady ? 'Traffic profile configured' : 'Traffic profile not set — pick or detect a stack in cluster config')}
        </div>
      )}
    </div>
  );
}
