import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Card, Icon, IconName, LinkButton, useStyles2 } from '@grafana/ui';
import { LINKS } from '../constants';

interface Feature {
  icon: IconName;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'sitemap',
    title: 'Live topology',
    desc: 'Cluster Status, Applications and Nodes straight from the Kubernetes API — no exporter required.',
  },
  {
    icon: 'apps',
    title: 'Curated dashboards',
    desc: '12 Prometheus dashboards: cluster, namespace, workload health, storage, networking and control plane.',
  },
  {
    icon: 'file-alt',
    title: 'Logs & traces',
    desc: 'Inline Loki logs (click a pod) and Tempo traces with a service graph, linked per cluster.',
  },
  {
    icon: 'calculator-alt',
    title: 'Cost Explorer',
    desc: 'Multi-cloud cost and idle spend, broken down by namespace, node and cloud — OpenCost optional.',
  },
  {
    icon: 'graph-bar',
    title: 'Services (RED) & SLO',
    desc: 'Rate, errors, latency and error-budget burn for 12 ingress / mesh stacks (Istio, Linkerd, nginx…).',
  },
  {
    icon: 'bell',
    title: 'Alert pack',
    desc: '25 Prometheus Operator alerts for nodes, workloads, storage and monitoring health.',
  },
];

const RESOURCES: Array<{ icon: IconName; label: string; href: string }> = [
  { icon: 'globe', label: 'devopstech.net', href: LINKS.website },
  { icon: 'book', label: 'Documentation', href: LINKS.docs },
  { icon: 'code-branch', label: 'Source on GitHub', href: LINKS.github },
  { icon: 'bug', label: 'Report an issue', href: LINKS.issues },
];

export function HomeInfo() {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>What&apos;s inside</h3>
      <p className={styles.sub}>
        One app turns Grafana into a turnkey Kubernetes observability product. Add a cluster above, link your
        Prometheus / Loki / Tempo, and explore:
      </p>

      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <Card.Figure>
              <Icon name={f.icon} size="xl" className={styles.icon} />
            </Card.Figure>
            <Card.Heading>{f.title}</Card.Heading>
            <Card.Description>{f.desc}</Card.Description>
          </Card>
        ))}
      </div>

      <h3 className={styles.heading}>Resources</h3>
      <div className={styles.links}>
        {RESOURCES.map((r) => (
          <LinkButton key={r.href} variant="secondary" icon={r.icon} href={r.href} target="_blank" rel="noopener noreferrer">
            {r.label}
          </LinkButton>
        ))}
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  section: css({ marginTop: theme.spacing(3) }),
  heading: css({
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    margin: theme.spacing(3, 0, 1),
  }),
  sub: css({ color: theme.colors.text.secondary, maxWidth: '70ch', marginBottom: theme.spacing(2) }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(1.5),
  }),
  icon: css({ color: theme.colors.primary.text }),
  links: css({ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1) }),
});
