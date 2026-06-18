import React, { ChangeEvent, useEffect, useState } from 'react';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { FieldSet, InlineField, InlineSwitch, Input, SecretInput, Select } from '@grafana/ui';
import { KubegrafDSOptions, SecureJsonData } from '../types';
import { PROMETHEUS_ID } from '../constants';

type Props = DataSourcePluginOptionsEditorProps<KubegrafDSOptions, SecureJsonData>;

const refreshRates: Array<SelectableValue<string>> = [
  { value: '15', label: '15s' },
  { value: '30', label: '30s' },
  { value: '60', label: '1m' },
  { value: '120', label: '2m' },
  { value: '300', label: '5m' },
];

const LABEL_WIDTH = 24;

export function ConfigEditor({ options, onOptionsChange }: Props) {
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData ?? {}) as SecureJsonData;

  const [promList, setPromList] = useState<Array<SelectableValue<string>>>([]);

  useEffect(() => {
    const list = getDataSourceSrv()
      .getList({ type: PROMETHEUS_ID })
      .map((ds) => ({ value: ds.name, label: ds.name }));
    setPromList(list);
  }, []);

  const setJsonData = (patch: Partial<KubegrafDSOptions>) => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, ...patch } });
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
            width={40}
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
            value={(jsonData as any).tlsSkipVerify === true}
            onChange={(e) => setJsonData({ tlsSkipVerify: e.currentTarget.checked } as Partial<KubegrafDSOptions>)}
          />
        </InlineField>

        {jsonData.access_via_token && (
          <InlineField label="Bearer token" labelWidth={LABEL_WIDTH}>
            <SecretInput
              width={40}
              isConfigured={Boolean(secureJsonFields?.access_token)}
              value={secureJsonData.access_token ?? ''}
              placeholder="ServiceAccount token"
              onReset={onResetToken}
              onChange={onTokenChange}
            />
          </InlineField>
        )}
      </FieldSet>

      <FieldSet label="Additional">
        <InlineField label="Prometheus instance" labelWidth={LABEL_WIDTH}>
          <Select
            width={40}
            options={promList}
            value={promList.find((o) => o.value === jsonData.prometheus_name) ?? null}
            onChange={(v) => setJsonData({ prometheus_name: v.value })}
          />
        </InlineField>
        <InlineField label="Refresh pods rate" labelWidth={LABEL_WIDTH}>
          <Select
            width={40}
            options={refreshRates}
            value={refreshRates.find((o) => o.value === String(jsonData.refresh_pods_rate)) ?? null}
            onChange={(v) => setJsonData({ refresh_pods_rate: v.value })}
          />
        </InlineField>
      </FieldSet>
    </>
  );
}
