import React, { ChangeEvent, useMemo } from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { FieldSet, InlineField, InlineSwitch, Input, SecretInput, Select } from '@grafana/ui';
import { CostSettings, KubegrafDSOptions, SecureJsonData } from '../types';
import {
  DsOption,
  listLogsDatasources,
  listMetricsDatasources,
  listTracesDatasources,
  migrateMetricsUid,
} from '../common/connections';

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

const toOptions = (list: DsOption[]): Array<SelectableValue<string>> =>
  list.map((d) => ({ value: d.uid, label: d.name }));

export function ConfigEditor({ options, onOptionsChange }: Props) {
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData ?? {}) as SecureJsonData;
  const cost: CostSettings = jsonData.cost ?? {};

  const metricsOptions = useMemo(() => toOptions(listMetricsDatasources()), []);
  const logsOptions = useMemo(() => toOptions(listLogsDatasources()), []);
  const tracesOptions = useMemo(() => toOptions(listTracesDatasources()), []);

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
