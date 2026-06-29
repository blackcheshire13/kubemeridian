import React from 'react';
import { PluginPage, locationService } from '@grafana/runtime';
import { EmptyState, LinkButton, LoadingPlaceholder } from '@grafana/ui';
import { EmbeddedScene } from '@grafana/scenes';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { buildLogsScene } from '../scenes/logs';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { KubegrafDSOptions } from '../types';

export class LogsPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    logsUid: undefined as string | undefined,
    scene: undefined as EmbeddedScene | undefined,
  };

  private mounted = true;

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      if (!this.mounted) {
        return;
      }
      const jsonData = this.cluster?.instanceSettings.jsonData as KubegrafDSOptions | undefined;
      const logsUid = jsonData?.logs_uid;
      this.setState({
        currentClusterId: this.cluster?.instanceSettings.uid,
        logsUid,
        scene: logsUid ? buildLogsScene({ logsUid }) : undefined,
        pageReady: true,
      });
    });

    this.getAvailableClusters().then((res) => {
      if (this.mounted) {
        this.setState({ clusters: res });
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { scene, logsUid, pageReady } = this.state;

    return (
      <PluginPage>
        <PageHeader
          active="logs"
          clusters={this.state.clusters}
          currentClusterId={this.state.currentClusterId}
          isAdmin={this.isAdmin}
          links={{
            status: this.generateCLusterStatusLink(),
            apps: this.generateApplicationsOverviewLink(),
            nodes: this.generateNodesOverviewLink(),
            events: this.generateEventsLink(),
            logs: this.generateLogsLink(),
            traces: this.generateTracesLink(),
            services: this.generateServicesLink(),
            cost: this.generateCostLink(),
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            locationService.push(`${PLUGIN_BASE_URL}/${ROUTES.Logs}/${value}`);
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading logs..." />}

        {pageReady && !logsUid && (
          <EmptyState variant="not-found" message="No Loki datasource is linked to this cluster">
            Link a Loki datasource in the cluster configuration to explore logs here.
            <div style={{ marginTop: 12 }}>
              <LinkButton icon="cog" href={this.generateEditLink()}>
                Configure cluster
              </LinkButton>
            </div>
          </EmptyState>
        )}

        {pageReady && scene && <scene.Component model={scene} />}
      </PluginPage>
    );
  }
}
