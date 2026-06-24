// Traffic-stack profiles: per-stack mapping of the metrics/labels needed to
// compute RED (Rate / Errors / Duration). The plugin ships a registry of common
// stacks; a cluster selects one (or "custom" with its own mapping). RED scenes
// build PromQL from the resolved profile, so they adapt to the user's stack.
//
// Metric/label names verified against current vendor docs (2026). Key gotchas:
// latency unit is not uniform (ms vs s); the status label takes three forms
// (numeric "5..", single digit "5", class "5xx"); errors sometimes live on a
// different metric than total (Envoy, Linkerd, HAProxy); namespace is often not
// a first-class label (regex-from-service); meshes double-count without a side
// filter (reporter/direction).

export interface TrafficProfile {
  id: string;
  label: string;
  /** Metric whose presence implies this stack is scraped (auto-detection). */
  detectMetric: string;
  /** Counter rate()'d for request throughput. */
  rateMetric: string;
  /** Metric carrying the error label (often == rateMetric). */
  errorMetric: string;
  /** How to select errors on errorMetric. */
  errorMatch: { label: string; regex: string };
  /** Denominator metric for the error ratio (often == errorMetric). */
  denomMetric: string;
  /** Histogram _bucket for percentiles, or null when the stack has none (HAProxy). */
  latencyBucket: string | null;
  /** Gauge fallback when there is no histogram (avg latency). */
  latencyAvgMetric?: string;
  latencyUnit: 's' | 'ms';
  /** Label identifying the service/workload. */
  serviceLabel: string;
  /** Namespace label, or null when namespace is embedded in the service name. */
  namespaceLabel: string | null;
  /** Default side filter to avoid mesh double-counting. */
  sideFilter?: { label: string; value: string };
  /** Shown when the detect metric exists but RED metrics are absent (often a toggle). */
  enablementHint?: string;
}

export const TRAFFIC_PROFILES: TrafficProfile[] = [
  {
    id: 'istio',
    label: 'Istio',
    detectMetric: 'istio_requests_total',
    rateMetric: 'istio_requests_total',
    errorMetric: 'istio_requests_total',
    errorMatch: { label: 'response_code', regex: '5..' },
    denomMetric: 'istio_requests_total',
    latencyBucket: 'istio_request_duration_milliseconds_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'destination_workload',
    namespaceLabel: 'destination_workload_namespace',
    sideFilter: { label: 'reporter', value: 'destination' },
  },
  {
    id: 'linkerd',
    label: 'Linkerd',
    detectMetric: 'response_latency_ms_bucket',
    rateMetric: 'response_total',
    errorMetric: 'response_total',
    errorMatch: { label: 'classification', regex: 'failure' },
    denomMetric: 'response_total',
    latencyBucket: 'response_latency_ms_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'deployment',
    namespaceLabel: 'namespace',
    sideFilter: { label: 'direction', value: 'inbound' },
    enablementHint: 'Requires the linkerd-viz Prometheus relabeling that adds deployment/namespace labels.',
  },
  {
    id: 'cilium-hubble',
    label: 'Cilium / Hubble',
    detectMetric: 'hubble_http_requests_total',
    rateMetric: 'hubble_http_requests_total',
    errorMetric: 'hubble_http_requests_total',
    errorMatch: { label: 'status', regex: '5..' },
    denomMetric: 'hubble_http_requests_total',
    latencyBucket: 'hubble_http_request_duration_seconds_bucket',
    latencyUnit: 's',
    serviceLabel: 'destination',
    namespaceLabel: 'destination_namespace',
    sideFilter: { label: 'reporter', value: 'server' },
    enablementHint: 'Needs hubble.metrics.enabled with the httpV2 set and L7 visibility; service/namespace labels are context-config-driven.',
  },
  {
    id: 'nginx',
    label: 'ingress-nginx',
    detectMetric: 'nginx_ingress_controller_requests',
    rateMetric: 'nginx_ingress_controller_requests',
    errorMetric: 'nginx_ingress_controller_requests',
    errorMatch: { label: 'status', regex: '5..' },
    denomMetric: 'nginx_ingress_controller_requests',
    latencyBucket: 'nginx_ingress_controller_request_duration_seconds_bucket',
    latencyUnit: 's',
    serviceLabel: 'ingress',
    namespaceLabel: 'namespace',
  },
  {
    id: 'traefik',
    label: 'Traefik (v2/v3)',
    detectMetric: 'traefik_service_requests_total',
    rateMetric: 'traefik_service_requests_total',
    errorMetric: 'traefik_service_requests_total',
    errorMatch: { label: 'code', regex: '5..' },
    denomMetric: 'traefik_service_requests_total',
    latencyBucket: 'traefik_service_request_duration_seconds_bucket',
    latencyUnit: 's',
    serviceLabel: 'service',
    namespaceLabel: null,
    enablementHint: 'Enable the Traefik Prometheus provider (metrics.prometheus). Namespace is embedded in the service name.',
  },
  {
    id: 'haproxy',
    label: 'HAProxy',
    detectMetric: 'haproxy_backend_http_responses_total',
    rateMetric: 'haproxy_backend_http_requests_total',
    errorMetric: 'haproxy_backend_http_responses_total',
    errorMatch: { label: 'code', regex: '5xx' },
    denomMetric: 'haproxy_backend_http_responses_total',
    latencyBucket: null,
    latencyAvgMetric: 'haproxy_backend_response_time_average_seconds',
    latencyUnit: 's',
    serviceLabel: 'proxy',
    namespaceLabel: null,
    enablementHint: 'HAProxy exposes no latency histogram — only an average gauge; percentiles are unavailable.',
  },
  {
    id: 'envoy',
    label: 'Envoy (Gateway API / Contour / Emissary)',
    detectMetric: 'envoy_cluster_upstream_rq_total',
    rateMetric: 'envoy_cluster_upstream_rq_total',
    errorMetric: 'envoy_cluster_upstream_rq_xx',
    errorMatch: { label: 'envoy_response_code_class', regex: '5|5xx' },
    denomMetric: 'envoy_cluster_upstream_rq_total',
    latencyBucket: 'envoy_cluster_upstream_rq_time_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'envoy_cluster_name',
    namespaceLabel: null,
    enablementHint: 'Requires /stats/prometheus scraped. envoy_cluster_name is opaque (namespace/service embedded).',
  },
  {
    id: 'kong',
    label: 'Kong',
    detectMetric: 'kong_http_requests_total',
    rateMetric: 'kong_http_requests_total',
    errorMetric: 'kong_http_requests_total',
    errorMatch: { label: 'code', regex: '5..' },
    denomMetric: 'kong_http_requests_total',
    latencyBucket: 'kong_request_latency_ms_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'service',
    namespaceLabel: null,
    enablementHint: 'Since Kong 3.0 enable config.status_code_metrics and config.latency_metrics on the Prometheus plugin.',
  },
  {
    id: 'consul',
    label: 'Consul Connect',
    detectMetric: 'consul_destination_service',
    rateMetric: 'envoy_cluster_upstream_rq_total',
    errorMetric: 'envoy_cluster_upstream_rq_xx',
    errorMatch: { label: 'envoy_response_code_class', regex: '5|5xx' },
    denomMetric: 'envoy_cluster_upstream_rq_total',
    latencyBucket: 'envoy_cluster_upstream_rq_time_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'consul_destination_service',
    namespaceLabel: 'consul_destination_namespace',
  },
  {
    id: 'kuma',
    label: 'Kuma / Kong Mesh',
    detectMetric: 'envoy_cluster_upstream_rq_total',
    rateMetric: 'envoy_cluster_upstream_rq_total',
    errorMetric: 'envoy_cluster_upstream_rq_xx',
    errorMatch: { label: 'envoy_response_code_class', regex: '5|5xx' },
    denomMetric: 'envoy_cluster_upstream_rq_total',
    latencyBucket: 'envoy_cluster_upstream_rq_time_bucket',
    latencyUnit: 'ms',
    serviceLabel: 'kuma_io_service',
    namespaceLabel: null,
    enablementHint: 'Identity (mesh/dataplane/kuma_io_service) arrives via Kuma SD relabeling, not in-metric tags.',
  },
  {
    id: 'prometheus-http',
    label: 'App metrics (Prometheus client)',
    detectMetric: 'http_requests_total',
    rateMetric: 'http_requests_total',
    errorMetric: 'http_requests_total',
    errorMatch: { label: 'code', regex: '5..' },
    denomMetric: 'http_requests_total',
    latencyBucket: 'http_request_duration_seconds_bucket',
    latencyUnit: 's',
    serviceLabel: 'job',
    namespaceLabel: 'namespace',
    enablementHint: 'Label names vary by client library (code vs status); namespace comes from the ServiceMonitor/PodMonitor.',
  },
  {
    id: 'otel-http',
    label: 'OpenTelemetry HTTP (semconv)',
    detectMetric: 'http_server_request_duration_seconds_bucket',
    rateMetric: 'http_server_request_duration_seconds_count',
    errorMetric: 'http_server_request_duration_seconds_count',
    errorMatch: { label: 'http_response_status_code', regex: '5..' },
    denomMetric: 'http_server_request_duration_seconds_count',
    latencyBucket: 'http_server_request_duration_seconds_bucket',
    latencyUnit: 's',
    serviceLabel: 'job',
    namespaceLabel: 'namespace',
    enablementHint: 'Stable HTTP semconv (v1.23+). service.name/service.namespace are resource attributes — set them as labels (target_info / resource promotion) or keep the job/namespace scrape labels. Older agents emit http_server_duration_milliseconds with http_status_code.',
  },
];

export const PROFILES_BY_ID: Record<string, TrafficProfile> = TRAFFIC_PROFILES.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<string, TrafficProfile>
);

export const DEFAULT_PROFILE_ID = 'prometheus-http';

// ---- per-cluster config -------------------------------------------------

/** Stored in datasource jsonData.traffic. */
export interface TrafficConfig {
  /** A registry profile id, or 'custom'. */
  profile: string;
  /** Field overrides; used as the whole mapping when profile === 'custom'. */
  custom?: Partial<TrafficProfile>;
}

/** Empty template used as the base for a fully-custom profile. */
const CUSTOM_DEFAULTS: TrafficProfile = {
  id: 'custom',
  label: 'Custom',
  detectMetric: '',
  rateMetric: '',
  errorMetric: '',
  errorMatch: { label: '', regex: '5..' },
  denomMetric: '',
  latencyBucket: null,
  latencyUnit: 's',
  serviceLabel: '',
  namespaceLabel: null,
};

/**
 * Resolve the effective profile: a registry profile (or an empty template for
 * 'custom') merged with any overrides. Empty-string overrides are dropped for
 * registry profiles so clearing a field reverts to the registry value rather
 * than clobbering it with '' (which would emit broken PromQL).
 */
export function resolveProfile(cfg?: TrafficConfig): TrafficProfile {
  const isCustom = cfg?.profile === 'custom';
  const base = isCustom
    ? CUSTOM_DEFAULTS
    : (cfg && cfg.profile && PROFILES_BY_ID[cfg.profile]) || PROFILES_BY_ID[DEFAULT_PROFILE_ID];

  const custom = cfg?.custom;
  if (!custom) {
    return base;
  }

  const clean: Partial<TrafficProfile> = {};
  for (const [k, v] of Object.entries(custom)) {
    // For registry profiles an empty string means "use the base value".
    if (v === '' && !isCustom) {
      continue;
    }
    (clean as any)[k] = v;
  }

  const errorMatch = { ...base.errorMatch, ...(clean.errorMatch ?? {}) };
  if (!errorMatch.label) {
    errorMatch.label = base.errorMatch.label;
  }
  if (!errorMatch.regex) {
    errorMatch.regex = base.errorMatch.regex;
  }

  return {
    ...base,
    ...clean,
    id: isCustom ? 'custom' : base.id,
    errorMatch,
    sideFilter: clean.sideFilter ?? base.sideFilter,
  };
}

/** A profile can build RED queries only with at least a rate metric + service label. */
export function isProfileComplete(p: TrafficProfile): boolean {
  return Boolean(p.rateMetric) && Boolean(p.serviceLabel);
}

// ---- PromQL builders ----------------------------------------------------

export const NS_VAR = '$namespace';
export const SVC_VAR = '$service';

/** Label-matcher body for the given profile, using $namespace/$service scene vars. */
export function matchers(p: TrafficProfile, opts: { includeNs?: boolean; includeSvc?: boolean } = {}): string {
  const { includeNs = true, includeSvc = true } = opts;
  const parts: string[] = [];
  if (p.sideFilter) {
    parts.push(`${p.sideFilter.label}="${p.sideFilter.value}"`);
  }
  if (p.namespaceLabel && includeNs) {
    parts.push(`${p.namespaceLabel}="${NS_VAR}"`);
  }
  if (includeSvc && p.serviceLabel) {
    parts.push(`${p.serviceLabel}=~"${SVC_VAR}"`);
  }
  return parts.join(', ');
}

const RI = '$__rate_interval';

export function rateExpr(p: TrafficProfile, window = RI): string {
  return `sum(rate(${p.rateMetric}{${matchers(p)}}[${window}]))`;
}

export function errorRatioExpr(p: TrafficProfile, window = RI): string {
  // Without an error label/metric we cannot identify errors — yield 0 rather
  // than emit a matcher with an empty label name (a PromQL parse error).
  if (!p.errorMatch.label || !p.errorMetric) {
    return '0';
  }
  const m = matchers(p);
  const errSel = m ? `${m}, ${p.errorMatch.label}=~"${p.errorMatch.regex}"` : `${p.errorMatch.label}=~"${p.errorMatch.regex}"`;
  return `sum(rate(${p.errorMetric}{${errSel}}[${window}])) / sum(rate(${p.denomMetric}{${m}}[${window}]))`;
}

export function latencyQuantileExpr(p: TrafficProfile, q: number, window = RI): string | null {
  if (!p.latencyBucket) {
    return null;
  }
  return `histogram_quantile(${q}, sum by (le)(rate(${p.latencyBucket}{${matchers(p)}}[${window}])))`;
}

/** Avg-latency fallback expression for stacks without a histogram (HAProxy). */
export function latencyAvgExpr(p: TrafficProfile): string | null {
  if (!p.latencyAvgMetric) {
    return null;
  }
  return `avg(${p.latencyAvgMetric}{${matchers(p)}})`;
}

/** Template-variable query for the namespace selector (null when not applicable). */
export function namespaceVarQuery(p: TrafficProfile): string | null {
  if (!p.namespaceLabel) {
    return null;
  }
  const side = p.sideFilter ? `${p.sideFilter.label}="${p.sideFilter.value}"` : '';
  return `label_values(${p.rateMetric}{${side}}, ${p.namespaceLabel})`;
}

/** Template-variable query for the service selector. */
export function serviceVarQuery(p: TrafficProfile): string {
  const parts: string[] = [];
  if (p.sideFilter) {
    parts.push(`${p.sideFilter.label}="${p.sideFilter.value}"`);
  }
  if (p.namespaceLabel) {
    parts.push(`${p.namespaceLabel}="${NS_VAR}"`);
  }
  return `label_values(${p.rateMetric}{${parts.join(', ')}}, ${p.serviceLabel})`;
}
