import React from 'react';
import { PluginPage } from '@grafana/runtime';
import { EmptyState, LinkButton, LoadingPlaceholder } from '@grafana/ui';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { CostExplorer } from '../components/CostExplorer';
import { CostModel, fetchCostModel } from '../cost/fetch';
import { resolveMetricsUid } from '../common/connections';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { KubegrafDSOptions } from '../types';

export class CostPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    metricsUid: undefined as string | undefined,
    model: undefined as CostModel | undefined,
    error: false,
  };

  private mounted = true;

  constructor(props: any) {
    super(props);

    this.prepareDs().then(async () => {
      if (!this.mounted) {
        return;
      }
      const jsonData = this.cluster?.instanceSettings.jsonData as KubegrafDSOptions | undefined;
      const metricsUid = resolveMetricsUid(jsonData);
      this.setState({ currentClusterId: this.cluster?.instanceSettings.uid, metricsUid });
      if (!metricsUid) {
        this.setState({ pageReady: true });
        return;
      }
      try {
        const model = await fetchCostModel(metricsUid);
        if (this.mounted) {
          this.setState({ model, pageReady: true });
        }
      } catch {
        if (this.mounted) {
          this.setState({ error: true, pageReady: true });
        }
      }
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
    const { model, metricsUid, pageReady, error } = this.state;

    return (
      <PluginPage>
        <PageHeader
          active="cost"
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
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.Cost}/${value}`;
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Computing cost..." />}

        {pageReady && !metricsUid && (
          <EmptyState variant="not-found" message="No metrics (Prometheus) datasource is linked to this cluster">
            Link a Prometheus datasource in the cluster configuration to see cost here.
            <div style={{ marginTop: 12 }}>
              <LinkButton icon="cog" href={this.generateEditLink()}>
                Configure cluster
              </LinkButton>
            </div>
          </EmptyState>
        )}

        {pageReady && metricsUid && error && (
          <EmptyState variant="not-found" message="Could not compute cost from the metrics datasource" />
        )}

        {pageReady && model && (
          <>
            <h2>Cost Explorer — {this.cluster?.instanceSettings.name}</h2>
            <CostExplorer model={model} />
          </>
        )}
      </PluginPage>
    );
  }
}
