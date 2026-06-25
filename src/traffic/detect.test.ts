import { detectProfiles } from './detect';

// Drives detectProfiles by deciding which detect metrics "have data".
let presentMetrics: string[] = [];

jest.mock('@grafana/runtime', () => ({
  getBackendSrv: () => ({
    get: (_url: string, params: { query: string }) => {
      const hit = presentMetrics.some((m) => params.query.includes(m));
      return Promise.resolve({ data: { result: hit ? [{ value: [0, '7'] }] : [] } });
    },
  }),
}));

describe('detectProfiles', () => {
  it('returns [] for an empty metrics uid without querying', async () => {
    presentMetrics = ['istio_requests_total'];
    expect(await detectProfiles('')).toEqual([]);
  });

  it('returns the profile whose detect metric has data', async () => {
    presentMetrics = ['istio_requests_total'];
    const ids = await detectProfiles('prom-uid');
    expect(ids).toContain('istio');
    expect(ids).not.toContain('nginx');
    expect(ids).not.toContain('envoy');
  });

  it('maps a shared detect metric to every profile that uses it', async () => {
    // envoy and kuma both probe envoy_cluster_upstream_rq_total
    presentMetrics = ['envoy_cluster_upstream_rq_total'];
    const ids = await detectProfiles('prom-uid');
    expect(ids).toEqual(expect.arrayContaining(['envoy', 'kuma']));
    expect(ids).not.toContain('istio');
  });

  it('returns [] when no known metric is present', async () => {
    presentMetrics = [];
    expect(await detectProfiles('prom-uid')).toEqual([]);
  });
});
