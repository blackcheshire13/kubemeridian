import React, { PureComponent } from 'react';
import { Alert, Button, EmptyState, LinkButton, LoadingPlaceholder, Stack } from '@grafana/ui';
import { PluginPage, getBackendSrv } from '@grafana/runtime';
import { APP_ID, DS_ID } from '../constants';
import { listMetricsDatasources } from '../common/connections';
import { K8sCluster } from '../types';
import { ClusterCard } from '../components/ClusterCard';
import { AddClusterModal } from '../components/AddClusterModal';

interface State {
  visible: boolean;
  clusters: K8sCluster[];
  addOpen: boolean;
}

export class ClustersListPage extends PureComponent<{}, State> {
  state: State = {
    visible: false,
    clusters: [],
    addOpen: false,
  };

  constructor(props: {}) {
    super(props);
    this.loadClusters();
  }

  deleteCluster = (uid: string) => {
    getBackendSrv()
      .delete(`/api/datasources/uid/${uid}`)
      .then(() => {
        this.setState({ clusters: this.state.clusters.filter((item) => item.uid !== uid) });
      });
  };

  loadClusters = async () => {
    const res = await getBackendSrv().get('/api/datasources');
    const clusters: K8sCluster[] = res
      .filter((item: any) => item.type === DS_ID)
      .map((item: any) => ({ id: item.id, uid: item.uid, name: item.name }));
    this.setState({ visible: true, clusters });
  };

  onCreated = () => {
    this.setState({ addOpen: false });
    this.loadClusters();
  };

  render() {
    const { visible, clusters, addOpen } = this.state;
    return (
      <PluginPage>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button variant="primary" icon="plus" onClick={() => this.setState({ addOpen: true })}>
            Add cluster
          </Button>
          <LinkButton variant="secondary" icon="cog" href={`/plugins/${APP_ID}`}>
            Plugin config
          </LinkButton>
        </Stack>

        {visible && listMetricsDatasources().length === 0 && (
          <Alert severity="info" title="No Prometheus datasource found">
            KubeMeridian dashboards and the Services (RED) page need a Prometheus-compatible datasource. Add one, then
            link it per cluster.{' '}
            <LinkButton size="sm" fill="text" href="/connections/datasources/new">
              Add datasource
            </LinkButton>
          </Alert>
        )}

        {!visible && <LoadingPlaceholder text="Loading clusters..." />}

        {visible && clusters.length === 0 && (
          <EmptyState
            variant="call-to-action"
            message="No Kubernetes clusters yet"
            button={
              <Button variant="primary" icon="plus" size="lg" onClick={() => this.setState({ addOpen: true })}>
                Add cluster
              </Button>
            }
          >
            Add a cluster by pointing it at a Kubernetes API server with a read-only ServiceAccount token. Each
            cluster you add can be browsed via Cluster Status, Applications and Nodes overviews.
          </EmptyState>
        )}

        {visible && clusters.length > 0 && (
          <Stack direction="column" gap={1}>
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.uid} cluster={cluster} clusterDelete={this.deleteCluster} />
            ))}
          </Stack>
        )}

        <AddClusterModal
          isOpen={addOpen}
          existingNames={clusters.map((c) => c.name)}
          onDismiss={() => this.setState({ addOpen: false })}
          onCreated={this.onCreated}
        />
      </PluginPage>
    );
  }
}
