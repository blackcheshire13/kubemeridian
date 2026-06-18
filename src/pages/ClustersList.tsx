import React, { PureComponent } from 'react';
import { Button, LinkButton, LoadingPlaceholder, Stack } from '@grafana/ui';
import { PluginPage, getBackendSrv, locationService } from '@grafana/runtime';
import { APP_ID, DS_ID } from '../constants';
import { K8sCluster } from '../types';
import { ClusterCard } from '../components/ClusterCard';

interface State {
  visible: boolean;
  clusters: K8sCluster[];
}

export class ClustersListPage extends PureComponent<{}, State> {
  state: State = {
    visible: false,
    clusters: [],
  };

  constructor(props: {}) {
    super(props);
    this.loadClusters();
  }

  deleteCluster = (uid: string) => {
    getBackendSrv()
      .delete(`/api/datasources/uid/${uid}`)
      .then(() => {
        this.setState({
          visible: true,
          clusters: this.state.clusters.filter((item) => item.uid !== uid),
        });
      });
  };

  createCluster = async () => {
    const name = this.generateName();
    const data = {
      name,
      type: DS_ID,
      access: 'proxy',
      jsonData: {
        access_via_token: true,
        refresh_pods_rate: '60',
      },
    };

    const res = await getBackendSrv().post('/api/datasources', data);
    locationService.push(`/connections/datasources/edit/${res.datasource.uid}`);
  };

  generateName = () => {
    let name = 'New K8S cluster';
    while (this.isNameExists(name)) {
      if (!this.nameHasSuffix(name)) {
        name = `${name}-1`;
      } else {
        name = `${this.getNewName(name)}${this.incrementLastDigit(this.getLastDigit(name))}`;
      }
    }
    return name;
  };

  private isNameExists = (name: string) =>
    this.state.clusters.filter((cluster) => cluster.name.toLowerCase() === name.toLowerCase()).length > 0;

  private nameHasSuffix = (name: string) => name.endsWith('-', name.length - 1);
  private getNewName = (name: string) => name.slice(0, name.length - 1);
  private incrementLastDigit = (digit: number) => (isNaN(digit) ? 1 : digit + 1);
  private getLastDigit = (name: string) => parseInt(name.slice(-1), 10);

  loadClusters = async () => {
    const res = await getBackendSrv().get('/api/datasources');
    const clusters: K8sCluster[] = res
      .filter((item: any) => item.type === DS_ID)
      .map((item: any) => ({ id: item.id, uid: item.uid, name: item.name }));
    this.setState({ visible: true, clusters });
  };

  render() {
    const { visible, clusters } = this.state;
    return (
      <PluginPage>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button variant="primary" icon="plus" onClick={this.createCluster}>
            Add new cluster
          </Button>
          <LinkButton variant="secondary" icon="cog" href={`/plugins/${APP_ID}`}>
            Plugin config
          </LinkButton>
        </Stack>

        {!visible && <LoadingPlaceholder text="Loading..." />}

        {visible && clusters.length === 0 && (
          <p>
            No Kubernetes clusters configured yet. Click <strong>Add new cluster</strong> to create a datasource
            pointing at a Kubernetes API server.
          </p>
        )}

        {visible && (
          <Stack direction="column" gap={1}>
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.uid} cluster={cluster} clusterDelete={this.deleteCluster} />
            ))}
          </Stack>
        )}
      </PluginPage>
    );
  }
}
