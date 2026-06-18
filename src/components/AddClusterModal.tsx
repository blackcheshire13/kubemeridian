import React, { useMemo, useState } from 'react';
import { SelectableValue } from '@grafana/data';
import { getBackendSrv, getDataSourceSrv } from '@grafana/runtime';
import { Alert, Button, Field, Input, InlineSwitch, Modal, Select } from '@grafana/ui';
import { DS_ID, PROMETHEUS_ID } from '../constants';

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
  const [prometheus, setPrometheus] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promOptions = useMemo<Array<SelectableValue<string>>>(
    () =>
      getDataSourceSrv()
        .getList({ type: PROMETHEUS_ID })
        .map((ds) => ({ value: ds.name, label: ds.name })),
    []
  );

  const nameTaken = existingNames.map((n) => n.toLowerCase()).includes(name.trim().toLowerCase());
  const canSubmit = name.trim().length > 0 && apiUrl.trim().length > 0 && !nameTaken && !busy;

  const reset = () => {
    setName('');
    setApiUrl('https://kubernetes.default.svc');
    setToken('');
    setTlsSkipVerify(true);
    setPrometheus(undefined);
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
          prometheus_name: prometheus,
          refresh_pods_rate: '60',
        },
        secureJsonData: token ? { access_token: token } : undefined,
      });
      reset();
      onCreated(res.datasource.uid);
    } catch (e: any) {
      setError(e?.data?.message ?? e?.statusText ?? 'Failed to create the cluster datasource');
      setBusy(false);
    }
  };

  return (
    <Modal title="Add Kubernetes cluster" isOpen={isOpen} onDismiss={onDismiss}>
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

      <Field label="Prometheus datasource" description="Used by the bundled dashboards for this cluster">
        <Select
          options={promOptions}
          value={promOptions.find((o) => o.value === prometheus) ?? null}
          onChange={(v) => setPrometheus(v?.value)}
          isClearable
          placeholder="Select Prometheus (optional)"
          width={40}
        />
      </Field>

      <Modal.ButtonRow>
        <Button variant="secondary" fill="outline" onClick={onDismiss}>
          Cancel
        </Button>
        <Button variant="primary" icon="plus" disabled={!canSubmit} onClick={submit}>
          {busy ? 'Adding…' : 'Add cluster'}
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
}
