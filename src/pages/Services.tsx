import React from 'react';
import { PluginPage, locationService } from '@grafana/runtime';
import { EmptyState, LinkButton, LoadingPlaceholder } from '@grafana/ui';
import { EmbeddedScene } from '@grafana/scenes';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { buildRedSloScene } from '../scenes/redslo';
import { resolveMetricsUid } from '../common/connections';
import { isProfileComplete, resolveProfile } from '../traffic/profiles';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { KubegrafDSOptions } from '../types';

export class ServicesPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    metricsUid: undefined as string | undefined,
    profileLabel: '',
    profileComplete: false,
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
      const metricsUid = resolveMetricsUid(jsonData);
      const profile = resolveProfile(jsonData?.traffic);
      const complete = isProfileComplete(profile);
      this.setState({
        currentClusterId: this.cluster?.instanceSettings.uid,
        metricsUid,
        profileLabel: profile.label,
        profileComplete: complete,
        scene: metricsUid && complete ? buildRedSloScene({ metricsUid, traffic: jsonData?.traffic }) : undefined,
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
    const { scene, metricsUid, profileLabel, profileComplete, pageReady } = this.state;

    return (
      <PluginPage>
        <PageHeader
          active="services"
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
            locationService.push(`${PLUGIN_BASE_URL}/${ROUTES.Services}/${value}`);
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading services..." />}

        {pageReady && !metricsUid && (
          <EmptyState variant="not-found" message="No metrics (Prometheus) datasource is linked to this cluster">
            Link a Prometheus datasource in the cluster configuration to see RED & SLO here.
            <div style={{ marginTop: 12 }}>
              <LinkButton icon="cog" href={this.generateEditLink()}>
                Configure cluster
              </LinkButton>
            </div>
          </EmptyState>
        )}

        {pageReady && metricsUid && !profileComplete && (
          <EmptyState variant="not-found" message="Traffic profile is incomplete">
            The selected traffic profile is missing a request metric or service label. Pick a stack or complete the
            custom mapping in the cluster configuration.
            <div style={{ marginTop: 12 }}>
              <LinkButton icon="cog" href={this.generateEditLink()}>
                Configure cluster
              </LinkButton>
            </div>
          </EmptyState>
        )}

        {pageReady && scene && (
          <>
            <h2>RED &amp; SLO — {this.cluster?.instanceSettings.name} · {profileLabel}</h2>
            <scene.Component model={scene} />
          </>
        )}
      </PluginPage>
    );
  }
}
