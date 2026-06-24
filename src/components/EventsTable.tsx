import React, { useMemo, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { Badge, EmptyState, Icon, InlineField, Input, Select, Stack, useStyles2 } from '@grafana/ui';

export interface KEvent {
  uid: string;
  type: string; // Normal | Warning
  reason: string;
  message: string;
  namespace: string;
  objectKind: string;
  objectName: string;
  source: string;
  count: number;
  lastSeenMs: number;
}

type TypeFilter = 'all' | 'Warning' | 'Normal';

function formatAge(ms: number): string {
  if (!ms) {
    return '—';
  }
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (sec < 60) {
    return `${sec}s`;
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min}m`;
  }
  const hrs = Math.floor(min / 60);
  if (hrs < 24) {
    return `${hrs}h`;
  }
  return `${Math.floor(hrs / 24)}d`;
}

const getStyles = (theme: GrafanaTheme2) => ({
  table: css({
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.bodySmall.fontSize,
    'th, td': {
      textAlign: 'left',
      padding: theme.spacing(0.75, 1),
      borderBottom: `1px solid ${theme.colors.border.weak}`,
      verticalAlign: 'top',
    },
    th: {
      position: 'sticky',
      top: 0,
      background: theme.colors.background.secondary,
      whiteSpace: 'nowrap',
    },
  }),
  warningRow: css({ background: theme.colors.warning.transparent }),
  message: css({ maxWidth: 640, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }),
  nowrap: css({ whiteSpace: 'nowrap' }),
  muted: css({ color: theme.colors.text.secondary }),
  scroll: css({ maxHeight: '70vh', overflow: 'auto', marginTop: theme.spacing(1) }),
});

interface Props {
  events: KEvent[];
}

export function EventsTable({ events }: Props) {
  const styles = useStyles2(getStyles);
  const [type, setType] = useState<TypeFilter>('all');
  const [namespace, setNamespace] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const namespaceOptions = useMemo<Array<SelectableValue<string>>>(() => {
    const names = Array.from(new Set(events.map((e) => e.namespace).filter(Boolean))).sort();
    return names.map((n) => ({ value: n, label: n }));
  }, [events]);

  const typeOptions: Array<SelectableValue<TypeFilter>> = [
    { value: 'all', label: 'All types' },
    { value: 'Warning', label: 'Warning' },
    { value: 'Normal', label: 'Normal' },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => (type === 'all' ? true : e.type === type))
      .filter((e) => (namespace ? e.namespace === namespace : true))
      .filter((e) =>
        q ? `${e.reason} ${e.message} ${e.objectName}`.toLowerCase().includes(q) : true
      )
      .sort((a, b) => b.lastSeenMs - a.lastSeenMs);
  }, [events, type, namespace, search]);

  const warnings = events.filter((e) => e.type === 'Warning').length;

  return (
    <Stack direction="column" gap={1}>
      <Stack direction="row" gap={1} alignItems="center" wrap="wrap">
        <InlineField label="Type">
          <Select
            width={18}
            options={typeOptions}
            value={typeOptions.find((o) => o.value === type)}
            onChange={(v) => setType((v?.value as TypeFilter) ?? 'all')}
          />
        </InlineField>
        <InlineField label="Namespace">
          <Select
            width={28}
            options={namespaceOptions}
            value={namespaceOptions.find((o) => o.value === namespace) ?? null}
            onChange={(v) => setNamespace(v?.value)}
            isClearable
            placeholder="All namespaces"
          />
        </InlineField>
        <Input
          width={36}
          prefix={<Icon name="search" />}
          placeholder="Filter by reason / message / object"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <span className={styles.muted}>
          {filtered.length} of {events.length} events · {warnings} warnings
        </span>
      </Stack>

      {filtered.length === 0 ? (
        <EmptyState variant="completed" message="No events match the current filters" />
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Last seen</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Object</th>
                <th>Namespace</th>
                <th>Count</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.uid} className={e.type === 'Warning' ? styles.warningRow : undefined}>
                  <td className={styles.nowrap}>{formatAge(e.lastSeenMs)}</td>
                  <td>
                    <Badge
                      text={e.type}
                      color={e.type === 'Warning' ? 'orange' : 'green'}
                    />
                  </td>
                  <td className={styles.nowrap}>{e.reason}</td>
                  <td className={styles.nowrap}>
                    <span className={styles.muted}>{e.objectKind}/</span>
                    {e.objectName}
                  </td>
                  <td className={styles.nowrap}>{e.namespace || '—'}</td>
                  <td>{e.count}</td>
                  <td className={styles.message}>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Stack>
  );
}
