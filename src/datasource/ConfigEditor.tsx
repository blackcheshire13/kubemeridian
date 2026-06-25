import React, { ChangeEvent, useMemo, useState } from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { Alert, Button, FieldSet, InlineField, InlineSwitch, Input, SecretInput, Select } from '@grafana/ui';
import { CostSettings, KubegrafDSOptions, SecureJsonData } from '../types';
import {
  listLogsDatasources,
  listMetricsDatasources,
  listTracesDatasources,
  migrateMetricsUid,
  toSelectOptions,
} from '../common/connections';
import { PROFILES_BY_ID, TRAFFIC_PROFILES, TrafficConfig, TrafficProfile } from '../traffic/profiles';
import { detectProfiles } from '../traffic/detect';

type Props = DataSourcePluginOptionsEditorProps<KubegrafDSOptions, SecureJsonData>;

const refreshRates: Array<SelectableValue<string>> = [
  { value: '15', label: '15s' },
  { value: '30', label: '30s' },
  { value: '60', label: '1m' },
  { value: '120', label: '2m' },
  { value: '300', label: '5m' },
];

const LABEL_WIDTH = 24;
const FIELD_WIDTH = 40;

export function ConfigEditor({ options, onOptionsChange }: Props) {
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData ?? {}) as SecureJsonData;
  const cost: CostSettings = jsonData.cost ?? {};
  const traffic: TrafficConfig = jsonData.traffic ?? { profile: '' };
  const custom: Partial<TrafficProfile> = traffic.custom ?? {};

  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<string[] | null>(null);

  const metricsOptions = useMemo(() => toSelectOptions(listMetricsDatasources()), []);
  const logsOptions = useMemo(() => toSelectOptions(listLogsDatasources()), []);
  const tracesOptions = useMemo(() => toSelectOptions(listTracesDatasources()), []);

  // Migrate the legacy prometheus_name (a NAME) to a UID for display.
  const metricsValue = useMemo(
    () => migrateMetricsUid(jsonData, listMetricsDatasources()),
    [jsonData]
  );

  const setJsonData = (patch: Partial<KubegrafDSOptions>) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, ...patch } });
  };

  const setCost = (patch: Partial<CostSettings>) => {
    setJsonData({ cost: { ...cost, ...patch } });
  };

  const setTraffic = (patch: Partial<TrafficConfig>) => {
    setJsonData({ traffic: { ...traffic, ...patch } });
  };

  const setCustom = (patch: Partial<TrafficProfile>) => {
    setTraffic({ custom: { ...custom, ...patch } });
  };

  const runDetect = async () => {
    setDetecting(true);
    setDetected(null);
    try {
      const ids = await detectProfiles(metricsValue ?? '');
      setDetected(ids);
      if (ids.length > 0) {
        setTraffic({ profile: ids[0] });
      }
    } finally {
      setDetecting(false);
    }
  };

  const profileOptions: Array<SelectableValue<string>> = [
    ...TRAFFIC_PROFILES.map((p) => ({ value: p.id, label: p.label })),
    { value: 'custom', label: 'Custom…' },
  ];
  const activeProfile = traffic.profile !== 'custom' ? PROFILES_BY_ID[traffic.profile] : undefined;

  // Keep the standard datasource url and jsonData.cluster_url (used by the proxy
  // route template) in sync so both access modes resolve to the same endpoint.
  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const url = event.currentTarget.value;
    onOptionsChange({ ...options, url, jsonData: { ...jsonData, cluster_url: url } });
  };

  const onTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: { ...secureJsonData, access_token: event.currentTarget.value },
    });
  };

  const onResetToken = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: { ...secureJsonFields, access_token: false },
      secureJsonData: { ...secureJsonData, access_token: '' },
    });
  };

  return (
    <>
      <FieldSet label="Kubernetes API">
        <InlineField label="API server URL" labelWidth={LABEL_WIDTH} tooltip="e.g. https://kubernetes.default.svc">
          <Input
            width={FIELD_WIDTH}
            value={jsonData.cluster_url ?? options.url ?? ''}
            placeholder="https://kubernetes.default.svc"
            onChange={onUrlChange}
          />
        </InlineField>

        <InlineField
          label="Access via bearer token"
          labelWidth={LABEL_WIDTH}
          tooltip="Proxy requests through Grafana and inject a ServiceAccount bearer token"
        >
          <InlineSwitch
            value={jsonData.access_via_token === true}
            onChange={(e) => setJsonData({ access_via_token: e.currentTarget.checked })}
          />
        </InlineField>

        <InlineField
          label="Skip TLS verify"
          labelWidth={LABEL_WIDTH}
          tooltip="Required for the in-cluster API server certificate signed by the cluster CA"
        >
          <InlineSwitch
            value={jsonData.tlsSkipVerify === true}
            onChange={(e) => setJsonData({ tlsSkipVerify: e.currentTarget.checked })}
          />
        </InlineField>

        {jsonData.access_via_token && (
          <InlineField label="Bearer token" labelWidth={LABEL_WIDTH}>
            <SecretInput
              width={FIELD_WIDTH}
              isConfigured={Boolean(secureJsonFields?.access_token)}
              value={secureJsonData.access_token ?? ''}
              placeholder="ServiceAccount token"
              onReset={onResetToken}
              onChange={onTokenChange}
            />
          </InlineField>
        )}
      </FieldSet>

      <FieldSet label="Connections">
        <InlineField
          label="Metrics (Prometheus)"
          labelWidth={LABEL_WIDTH}
          tooltip="Prometheus / Mimir / Thanos backing the bundled dashboards"
        >
          <Select
            width={FIELD_WIDTH}
            options={metricsOptions}
            value={metricsOptions.find((o) => o.value === metricsValue) ?? null}
            onChange={(v) => setJsonData({ metrics_uid: v?.value, prometheus_name: undefined })}
            isClearable
            placeholder="Select Prometheus"
          />
        </InlineField>

        <InlineField label="Logs (Loki)" labelWidth={LABEL_WIDTH} tooltip="Loki datasource for inline pod/workload logs">
          <Select
            width={FIELD_WIDTH}
            options={logsOptions}
            value={logsOptions.find((o) => o.value === jsonData.logs_uid) ?? null}
            onChange={(v) => setJsonData({ logs_uid: v?.value })}
            isClearable
            placeholder="Select Loki (optional)"
          />
        </InlineField>

        <InlineField label="Traces (Tempo)" labelWidth={LABEL_WIDTH} tooltip="Tempo datasource for traces and service graph">
          <Select
            width={FIELD_WIDTH}
            options={tracesOptions}
            value={tracesOptions.find((o) => o.value === jsonData.traces_uid) ?? null}
            onChange={(v) => setJsonData({ traces_uid: v?.value })}
            isClearable
            placeholder="Select Tempo (optional)"
          />
        </InlineField>
      </FieldSet>

      <FieldSet label="Cost (FinOps)">
        <InlineField
          label="OpenCost present"
          labelWidth={LABEL_WIDTH}
          tooltip="Use real OpenCost/Kubecost hourly cost metrics instead of estimating from requests"
        >
          <InlineSwitch
            value={cost.opencost_present === true}
            onChange={(e) => setCost({ opencost_present: e.currentTarget.checked })}
          />
        </InlineField>

        {!cost.opencost_present && (
          <>
            <InlineField label="$ / vCPU-hour" labelWidth={LABEL_WIDTH} tooltip="Estimated price per vCPU-hour">
              <Input
                width={FIELD_WIDTH}
                type="number"
                value={cost.cpu_hourly ?? ''}
                placeholder="0.031"
                onChange={(e) => setCost({ cpu_hourly: e.currentTarget.value })}
              />
            </InlineField>
            <InlineField label="$ / GiB-hour" labelWidth={LABEL_WIDTH} tooltip="Estimated price per GiB-hour of memory">
              <Input
                width={FIELD_WIDTH}
                type="number"
                value={cost.mem_hourly ?? ''}
                placeholder="0.004"
                onChange={(e) => setCost({ mem_hourly: e.currentTarget.value })}
              />
            </InlineField>
          </>
        )}
      </FieldSet>

      <FieldSet label="Traffic / RED source">
        <InlineField
          label="Stack profile"
          labelWidth={LABEL_WIDTH}
          tooltip="Which ingress controller / service mesh exposes your request metrics. Drives the RED & SLO page."
        >
          <Select
            width={FIELD_WIDTH}
            options={profileOptions}
            value={profileOptions.find((o) => o.value === traffic.profile) ?? null}
            onChange={(v) => setTraffic({ profile: v?.value ?? '' })}
            placeholder="Select your stack (or Custom…)"
          />
        </InlineField>

        <InlineField label="Auto-detect" labelWidth={LABEL_WIDTH} tooltip="Probe the metrics datasource for known stack metrics">
          <Button variant="secondary" icon="search" disabled={!metricsValue || detecting} onClick={runDetect}>
            {detecting ? 'Detecting…' : 'Detect from Prometheus'}
          </Button>
        </InlineField>

        {detected && (
          <Alert
            severity={detected.length ? 'success' : 'info'}
            title={detected.length ? `Detected: ${detected.map((id) => PROFILES_BY_ID[id]?.label ?? id).join(', ')}` : 'No known traffic metrics found'}
          >
            {detected.length
              ? 'Selected the first match. Pick another above if you prefer.'
              : 'None of the known ingress/mesh metrics are present. Some stacks must be enabled (Traefik provider, Kong status/latency metrics, Cilium L7) — or use Custom.'}
          </Alert>
        )}

        {activeProfile?.enablementHint && (
          <Alert severity="info" title="Note">
            {activeProfile.enablementHint}
          </Alert>
        )}

        {traffic.profile === 'custom' && (
          <>
            <InlineField label="Request metric" labelWidth={LABEL_WIDTH} tooltip="Counter to rate() for throughput. Most stacks expose throughput and errors on the same counter (errors selected via the error label below), so this value also seeds the denominator and error metric — override them only if your errors live on a separate metric.">
              <Input width={FIELD_WIDTH} value={custom.rateMetric ?? ''} placeholder="http_requests_total" onChange={(e) => setCustom({ rateMetric: e.currentTarget.value, denomMetric: e.currentTarget.value, errorMetric: e.currentTarget.value })} />
            </InlineField>
            <InlineField label="Error label" labelWidth={LABEL_WIDTH} tooltip="Label carrying the status (e.g. response_code, code, status)">
              <Input width={FIELD_WIDTH} value={custom.errorMatch?.label ?? ''} placeholder="code" onChange={(e) => setCustom({ errorMatch: { label: e.currentTarget.value, regex: custom.errorMatch?.regex ?? '5..' } })} />
            </InlineField>
            <InlineField label="Error regex" labelWidth={LABEL_WIDTH} tooltip='How errors match (e.g. 5.. or 5xx or 5)'>
              <Input width={FIELD_WIDTH} value={custom.errorMatch?.regex ?? ''} placeholder="5.." onChange={(e) => setCustom({ errorMatch: { label: custom.errorMatch?.label ?? 'code', regex: e.currentTarget.value } })} />
            </InlineField>
            <InlineField label="Latency bucket metric" labelWidth={LABEL_WIDTH} tooltip="Histogram _bucket metric (leave empty if none)">
              <Input width={FIELD_WIDTH} value={custom.latencyBucket ?? ''} placeholder="http_request_duration_seconds_bucket" onChange={(e) => setCustom({ latencyBucket: e.currentTarget.value || null })} />
            </InlineField>
            <InlineField label="Latency unit" labelWidth={LABEL_WIDTH}>
              <Select
                width={FIELD_WIDTH}
                options={[{ value: 's', label: 'seconds' }, { value: 'ms', label: 'milliseconds' }]}
                value={custom.latencyUnit ?? 's'}
                onChange={(v) => setCustom({ latencyUnit: (v?.value as 's' | 'ms') ?? 's' })}
              />
            </InlineField>
            <InlineField label="Service label" labelWidth={LABEL_WIDTH}>
              <Input width={FIELD_WIDTH} value={custom.serviceLabel ?? ''} placeholder="job" onChange={(e) => setCustom({ serviceLabel: e.currentTarget.value })} />
            </InlineField>
            <InlineField label="Namespace label" labelWidth={LABEL_WIDTH} tooltip="Leave empty if namespace is embedded in the service name">
              <Input width={FIELD_WIDTH} value={custom.namespaceLabel ?? ''} placeholder="namespace" onChange={(e) => setCustom({ namespaceLabel: e.currentTarget.value || null })} />
            </InlineField>
          </>
        )}
      </FieldSet>

      <FieldSet label="Behaviour">
        <InlineField label="Refresh pods rate" labelWidth={LABEL_WIDTH}>
          <Select
            width={FIELD_WIDTH}
            options={refreshRates}
            value={refreshRates.find((o) => o.value === String(jsonData.refresh_pods_rate)) ?? null}
            onChange={(v) => setJsonData({ refresh_pods_rate: v?.value })}
          />
        </InlineField>
      </FieldSet>
    </>
  );
}
