import {
  PROFILES_BY_ID,
  errorRatioExpr,
  latencyQuantileExpr,
  matchers,
  namespaceVarQuery,
  rateExpr,
  resolveProfile,
} from './profiles';

describe('traffic profiles', () => {
  it('registry has the expected stacks', () => {
    for (const id of ['istio', 'linkerd', 'nginx', 'traefik', 'haproxy', 'envoy', 'kong', 'prometheus-http', 'otel-http']) {
      expect(PROFILES_BY_ID[id]).toBeDefined();
    }
  });

  it('istio matchers include the destination side filter and namespace label', () => {
    const m = matchers(PROFILES_BY_ID['istio']);
    expect(m).toContain('reporter="destination"');
    expect(m).toContain('destination_workload_namespace="$namespace"');
    expect(m).toContain('destination_workload=~"$service"');
  });

  it('istio rate/error/latency build correctly (ms histogram)', () => {
    const p = PROFILES_BY_ID['istio'];
    expect(rateExpr(p)).toBe('sum(rate(istio_requests_total{reporter="destination", destination_workload_namespace="$namespace", destination_workload=~"$service"}[$__rate_interval]))');
    expect(errorRatioExpr(p)).toContain('response_code=~"5.."');
    expect(latencyQuantileExpr(p, 0.99)).toContain('istio_request_duration_milliseconds_bucket');
  });

  it('envoy errors use a different metric and single-digit class', () => {
    const e = errorRatioExpr(PROFILES_BY_ID['envoy']);
    expect(e).toContain('envoy_cluster_upstream_rq_xx{');
    expect(e).toContain('envoy_response_code_class=~"5"');
    expect(e).toContain('/ sum(rate(envoy_cluster_upstream_rq_total{');
  });

  it('haproxy has no histogram', () => {
    expect(latencyQuantileExpr(PROFILES_BY_ID['haproxy'], 0.99)).toBeNull();
  });

  it('profiles without a namespace label omit it and produce no namespace var', () => {
    const p = PROFILES_BY_ID['traefik'];
    expect(matchers(p)).not.toContain('$namespace');
    expect(namespaceVarQuery(p)).toBeNull();
    expect(namespaceVarQuery(PROFILES_BY_ID['istio'])).toContain('destination_workload_namespace');
  });

  it('resolveProfile merges custom overrides', () => {
    const r = resolveProfile({ profile: 'istio', custom: { serviceLabel: 'app', errorMatch: { label: 'code', regex: '4..|5..' } } });
    expect(r.serviceLabel).toBe('app');
    expect(r.errorMatch).toEqual({ label: 'code', regex: '4..|5..' });
    // untouched fields stay from the base
    expect(r.rateMetric).toBe('istio_requests_total');
  });

  it('resolveProfile falls back to the default when unknown', () => {
    expect(resolveProfile(undefined).id).toBe('prometheus-http');
    expect(resolveProfile({ profile: 'nope' }).id).toBe('prometheus-http');
  });
});
