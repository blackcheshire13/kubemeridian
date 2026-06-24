import { migrateMetricsUid } from './connections';

const promList = [
  { uid: 'prom-uid-1', name: 'Prometheus' },
  { uid: 'prom-uid-2', name: 'Thanos' },
];

describe('migrateMetricsUid', () => {
  it('returns metrics_uid when set', () => {
    expect(migrateMetricsUid({ metrics_uid: 'prom-uid-2' }, promList)).toBe('prom-uid-2');
  });

  it('prefers metrics_uid over the legacy prometheus_name', () => {
    expect(migrateMetricsUid({ metrics_uid: 'prom-uid-2', prometheus_name: 'Prometheus' }, promList)).toBe('prom-uid-2');
  });

  it('migrates a legacy prometheus_name to its UID', () => {
    expect(migrateMetricsUid({ prometheus_name: 'Prometheus' }, promList)).toBe('prom-uid-1');
  });

  it('returns undefined when the legacy name no longer resolves', () => {
    expect(migrateMetricsUid({ prometheus_name: 'Gone' }, promList)).toBeUndefined();
  });

  it('returns undefined when nothing is configured', () => {
    expect(migrateMetricsUid({}, promList)).toBeUndefined();
    expect(migrateMetricsUid(undefined, promList)).toBeUndefined();
  });
});
