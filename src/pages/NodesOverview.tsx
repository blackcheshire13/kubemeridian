import React from 'react';
import { BasePage } from './BasePage';
import { PluginPage } from '@grafana/runtime';
import { PageHeader } from '../components/PageHeader';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';

export class NodesOverviewPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterName: '',
    currentClusterId: '',
  };

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      this.setState({
        ...this.state,
        currentClusterName: this.cluster?.instanceSettings.name,
        currentClusterId: this.cluster?.instanceSettings.id,
        pageReady: true,
      });
      this.getNodesMap();
    });

    this.getAvailableClusters().then((res) => {
      this.setState({ ...this.state, clusters: res });
    });
  }

  render() {
    return (
      <PluginPage>
        <PageHeader
          active="nodes"
          clusters={this.state.clusters}
          currentClusterId={this.state.currentClusterId}
          isAdmin={this.isAdmin}
          links={{
            status: this.generateCLusterStatusLink(),
            apps: this.generateApplicationsOverviewLink(),
            nodes: this.generateNodesOverviewLink(),
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.NodesOverview}/${value}`;
          }}
        />

        {this.state.pageReady && <h2>Overview: {this.cluster?.instanceSettings.name}. Nodes</h2>}
      </PluginPage>
    );
  }
}
