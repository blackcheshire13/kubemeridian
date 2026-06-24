import React, { useMemo, useState } from 'react';
import { getBackendSrv } from '@grafana/runtime';
import { Alert, Button, Field, Input, InlineSwitch, Modal, Select } from '@grafana/ui';
import { DS_ID } from '../constants';
import { listLogsDatasources, listMetricsDatasources, listTracesDatasources, toSelectOptions } from '../common/connections';

interface Props {
  isOpen: boolean;
  existingNames: string[];
  onDismiss: () => void;
  onCreated: (uid: string) => void;
}

export function AddClusterModal({ isOpen, existingNames, onDismiss, onCreated }: Props) {
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('https://kubernetes.default.svc');
  const [token, setToken] = useState('');
  const [tlsSkipVerify, setTlsSkipVerify] = useState(true);
  const [metricsUid, setMetricsUid] = useState<string | undefined>();
  const [logsUid, setLogsUid] = useState<string | undefined>();
  const [tracesUid, setTracesUid] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metricsOptions = useMemo(() => toSelectOptions(listMetricsDatasources()), []);
  const logsOptions = useMemo(() => toSelectOptions(listLogsDatasources()), []);
  const tracesOptions = useMemo(() => toSelectOptions(listTracesDatasources()), []);

  const nameTaken = existingNames.map((n) => n.toLowerCase()).includes(name.trim().toLowerCase());
  const canSubmit = name.trim().length > 0 && apiUrl.trim().length > 0 && !nameTaken && !busy;

  const reset = () => {
    setName('');
    setApiUrl('https://kubernetes.default.svc');
    setToken('');
    setTlsSkipVerify(true);
    setMetricsUid(undefined);
    setLogsUid(undefined);
    setTracesUid(undefined);
    setError(null);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await getBackendSrv().post('/api/datasources', {
        name: name.trim(),
        type: DS_ID,
        access: 'proxy',
        jsonData: {
          cluster_url: apiUrl.trim(),
          access_via_token: true,
          tlsSkipVerify,
          metrics_uid: metricsUid,
          logs_uid: logsUid,
          traces_uid: tracesUid,
          refresh_pods_rate: '60',
        },
        secureJsonData: token ? { access_token: token } : undefined,
      });
      const uid = res?.datasource?.uid;
      if (!uid) {
        throw new Error('Datasource created but no uid was returned');
      }
      reset();
      onCreated(uid);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.statusText ?? e?.message ?? 'Failed to create the cluster datasource');
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  return (
    <Modal title="Add Kubernetes cluster" isOpen={isOpen} onDismiss={handleDismiss}>
      {error && (
        <Alert title="Could not add cluster" severity="error">
          {error}
        </Alert>
      )}

      <Field label="Cluster name" required invalid={nameTaken} error={nameTaken ? 'A cluster with this name already exists' : undefined}>
        <Input
          autoFocus
          value={name}
          placeholder="e.g. production / staging / internal"
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </Field>

      <Field label="Kubernetes API server URL" required description="In-cluster Grafana can use https://kubernetes.default.svc">
        <Input value={apiUrl} placeholder="https://kubernetes.default.svc" onChange={(e) => setApiUrl(e.currentTarget.value)} />
      </Field>

      <Field label="ServiceAccount bearer token" description="Read-only token used to query the Kubernetes API">
        <Input type="password" value={token} placeholder="eyJhbGciOi..." onChange={(e) => setToken(e.currentTarget.value)} />
      </Field>

      <Field label="Skip TLS verify" description="Required for the in-cluster API server certificate">
        <InlineSwitch value={tlsSkipVerify} onChange={(e) => setTlsSkipVerify(e.currentTarget.checked)} />
      </Field>

      <Field label="Metrics (Prometheus)" description="Backs the bundled dashboards for this cluster">
        <Select
          options={metricsOptions}
          value={metricsOptions.find((o) => o.value === metricsUid) ?? null}
          onChange={(v) => setMetricsUid(v?.value)}
          isClearable
          placeholder="Select Prometheus (optional)"
          width={40}
        />
      </Field>

      <Field label="Logs (Loki)" description="Enables inline pod and workload logs">
        <Select
          options={logsOptions}
          value={logsOptions.find((o) => o.value === logsUid) ?? null}
          onChange={(v) => setLogsUid(v?.value)}
          isClearable
          placeholder="Select Loki (optional)"
          width={40}
        />
      </Field>

      <Field label="Traces (Tempo)" description="Enables traces and the service graph">
        <Select
          options={tracesOptions}
          value={tracesOptions.find((o) => o.value === tracesUid) ?? null}
          onChange={(v) => setTracesUid(v?.value)}
          isClearable
          placeholder="Select Tempo (optional)"
          width={40}
        />
      </Field>

      <Modal.ButtonRow>
        <Button variant="secondary" fill="outline" onClick={handleDismiss}>
          Cancel
        </Button>
        <Button variant="primary" icon="plus" disabled={!canSubmit} onClick={submit}>
          {busy ? 'Adding…' : 'Add cluster'}
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
}
