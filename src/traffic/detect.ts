import { getBackendSrv } from '@grafana/runtime';
import { TRAFFIC_PROFILES } from './profiles';

/**
 * Probe the linked metrics datasource for each profile's detect metric and
 * return the ids of the stacks that currently have data. Uses the Prometheus
 * datasource resources proxy (instant query). Best-effort: failures are ignored.
 */
export async function detectProfiles(metricsUid: string): Promise<string[]> {
  if (!metricsUid) {
    return [];
  }
  // Dedupe detect metrics so we don't query the same one repeatedly.
  const seen = new Set<string>();
  const checks = TRAFFIC_PROFILES.filter((p) => {
    if (seen.has(p.detectMetric)) {
      return false;
    }
    seen.add(p.detectMetric);
    return true;
  });

  const present = new Set<string>();
  await Promise.all(
    checks.map(async (p) => {
      try {
        const res: any = await getBackendSrv().get(
          `/api/datasources/uid/${metricsUid}/resources/api/v1/query`,
          { query: `count(${p.detectMetric})` }
        );
        const result = res?.data?.result ?? [];
        const value = Number(result[0]?.value?.[1] ?? 0);
        if (result.length > 0 && value > 0) {
          present.add(p.detectMetric);
        }
      } catch {
        /* ignore — treat as absent */
      }
    })
  );

  return TRAFFIC_PROFILES.filter((p) => present.has(p.detectMetric)).map((p) => p.id);
}
