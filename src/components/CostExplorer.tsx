import React, { useMemo, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Badge, Icon, Stack, useStyles2 } from '@grafana/ui';
import { CostModel } from '../cost/fetch';
import { CATALOG_DATE } from '../cost/prices';
import { CostTier, TIER_LABEL } from '../cost/pricing';

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const pct = (n?: number) => (n == null ? '—' : `${(n * 100).toFixed(0)}%`);

const getStyles = (theme: GrafanaTheme2) => ({
  wrap: css({ display: 'flex', flexDirection: 'column', gap: theme.spacing(2), marginTop: theme.spacing(1) }),
  stats: css({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: theme.spacing(1.5) }),
  card: css({
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.weak}`,
    borderRadius: theme.shape.radius.default,
    padding: theme.spacing(1.5, 2),
  }),
  label: css({ color: theme.colors.text.secondary, fontSize: theme.typography.bodySmall.fontSize, textTransform: 'uppercase', letterSpacing: '0.04em' }),
  big: css({ fontSize: '1.9rem', fontWeight: 600, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }),
  sub: css({ color: theme.colors.text.secondary, fontSize: theme.typography.bodySmall.fontSize }),
  h3: css({ margin: theme.spacing(1, 0, 0.5), fontSize: theme.typography.h5.fontSize }),
  table: css({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.bodySmall.fontSize,
    'th, td': { textAlign: 'left', padding: theme.spacing(0.6, 1), borderBottom: `1px solid ${theme.colors.border.weak}` },
    'td.num, th.num': { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    th: { position: 'sticky', top: 0, background: theme.colors.background.secondary, whiteSpace: 'nowrap' },
  }),
  bar: css({ height: 6, borderRadius: 3, background: theme.colors.primary.main, minWidth: 2 }),
  barCell: css({ width: 120 }),
  scroll: css({ maxHeight: '46vh', overflow: 'auto', border: `1px solid ${theme.colors.border.weak}`, borderRadius: theme.shape.radius.default }),
  note: css({ color: theme.colors.text.secondary, fontSize: theme.typography.bodySmall.fontSize }),
  muted: css({ color: theme.colors.text.secondary }),
});

const tierColor = (t: CostTier): 'green' | 'blue' | 'orange' | 'red' =>
  t === 0 ? 'green' : t === 1 ? 'blue' : t === 2 ? 'orange' : 'red';

export function CostExplorer({ model }: { model: CostModel }) {
  const styles = useStyles2(getStyles);
  const [showAllNs, setShowAllNs] = useState(false);
  const { cluster, nodes, byCloud, openCost, hasInstanceTypes, tiers } = model;

  const idlePct = cluster.totalMonthly > 0 ? cluster.idleMonthly / cluster.totalMonthly : 0;
  const maxNs = cluster.items[0]?.monthly || 1;
  const nsRows = showAllNs ? cluster.items : cluster.items.slice(0, 15);

  const tierBadges = useMemo(
    () =>
      ([0, 1, 2, 3] as CostTier[])
        .filter((t) => (tiers[t] ?? 0) > 0)
        .map((t) => ({ t, n: tiers[t] })),
    [tiers]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.stats}>
        <div className={styles.card}>
          <div className={styles.label}>Est. cost / month</div>
          <div className={styles.big}>{usd0.format(cluster.totalMonthly)}</div>
          <div className={styles.sub}>{usd2.format(cluster.totalMonthly / 730)}/hr · {nodes.length} nodes</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Allocated</div>
          <div className={styles.big}>{usd0.format(cluster.allocatedMonthly)}</div>
          <div className={styles.sub}>by requests, across {cluster.items.length} namespaces</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Idle (unrequested)</div>
          <div className={styles.big} style={{ color: idlePct > 0.4 ? '#F2B441' : undefined }}>{usd0.format(cluster.idleMonthly)}</div>
          <div className={styles.sub}>{pct(idlePct)} of total capacity cost</div>
        </div>
        <div className={styles.card}>
          <div className={styles.label}>Pricing source</div>
          <Stack direction="row" gap={0.5} wrap="wrap">
            {tierBadges.map(({ t, n }) => (
              <Badge key={t} text={`${TIER_LABEL[t]} ·${n}`} color={tierColor(t)} />
            ))}
          </Stack>
          <div className={styles.sub} style={{ marginTop: 6 }}>{openCost ? 'OpenCost detected' : `catalog ${CATALOG_DATE}`}</div>
        </div>
      </div>

      {!openCost && (
        <div className={styles.note}>
          <Icon name="info-circle" />{' '}
          {hasInstanceTypes
            ? 'Priced from the bundled instance-type catalog. Install OpenCost for billing-accurate cost (spot, PV, LB, egress).'
            : 'Node instance types are not exposed — using per-cloud flat estimates. Add the instance-type/region labels to kube-state-metrics (--metric-labels-allowlist) for catalog pricing, or install OpenCost for accuracy.'}
        </div>
      )}

      <div>
        <div className={styles.h3}>By namespace · top spenders</div>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Namespace</th>
                <th className="num">$/month</th>
                <th>share</th>
                <th className="num">CPU req</th>
                <th className="num">Mem req</th>
                <th className="num">CPU eff</th>
                <th className="num">Mem eff</th>
              </tr>
            </thead>
            <tbody>
              {nsRows.map((r) => (
                <tr key={r.namespace}>
                  <td>{r.namespace}</td>
                  <td className="num">{usd0.format(r.monthly)}</td>
                  <td className={styles.barCell}>
                    <div className={styles.bar} style={{ width: `${Math.max(2, (r.monthly / maxNs) * 100)}%` }} />
                  </td>
                  <td className="num">{r.cpuReq.toFixed(1)}</td>
                  <td className="num">{r.memReqGiB.toFixed(1)} Gi</td>
                  <td className="num">{pct(r.cpuEff)}</td>
                  <td className="num">{pct(r.memEff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cluster.items.length > 15 && (
          <a className={styles.muted} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setShowAllNs((v) => !v)}>
            {showAllNs ? 'Show top 15' : `Show all ${cluster.items.length}`}
          </a>
        )}
      </div>

      <Stack direction="row" gap={2} wrap="wrap">
        <div style={{ flex: '1 1 360px' }}>
          <div className={styles.h3}>By node</div>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Node</th>
                  <th>Cloud</th>
                  <th>Type</th>
                  <th>Tier</th>
                  <th className="num">$/hr</th>
                  <th className="num">$/mo</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.node}>
                    <td>{n.node}</td>
                    <td>{n.cloud}</td>
                    <td>{n.instanceType ?? <span className={styles.muted}>{n.vcpu}cpu/{n.memGiB.toFixed(0)}Gi</span>}</td>
                    <td><Badge text={TIER_LABEL[n.tier]} color={tierColor(n.tier)} /></td>
                    <td className="num">{usd2.format(n.hourly)}</td>
                    <td className="num">{usd0.format(n.monthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ flex: '0 1 280px' }}>
          <div className={styles.h3}>By cloud</div>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cloud</th>
                  <th className="num">Nodes</th>
                  <th className="num">$/month</th>
                </tr>
              </thead>
              <tbody>
                {byCloud.map((g) => (
                  <tr key={g.cloud}>
                    <td>{g.label}</td>
                    <td className="num">{g.nodes}</td>
                    <td className="num">{usd0.format(g.monthly)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Stack>
    </div>
  );
}
