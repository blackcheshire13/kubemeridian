import React from 'react';
import { PluginPage } from '@grafana/runtime';
import { EmptyState, LinkButton, LoadingPlaceholder } from '@grafana/ui';
import { EmbeddedScene } from '@grafana/scenes';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { buildTracesScene } from '../scenes/traces';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { KubegrafDSOptions } from '../types';

export class TracesPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    tracesUid: undefined as string | undefined,
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
      const tracesUid = jsonData?.traces_uid;
      this.setState({
        currentClusterId: this.cluster?.instanceSettings.uid,
        tracesUid,
        scene: tracesUid ? buildTracesScene({ tracesUid }) : undefined,
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
    const { scene, tracesUid, pageReady } = this.state;

    return (
      <PluginPage>
        <PageHeader
          active="traces"
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
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.Traces}/${value}`;
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading traces..." />}

        {pageReady && !tracesUid && (
          <EmptyState variant="not-found" message="No Tempo datasource is linked to this cluster">
            Link a Tempo datasource in the cluster configuration to explore traces and the service graph here.
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
