import React from 'react';
import { BasePage } from './BasePage';
import { PluginPage } from '@grafana/runtime';
import { LoadingPlaceholder } from '@grafana/ui';
import { cx } from '@emotion/css';
import { PageHeader } from '../components/PageHeader';
import { ClusterComponent } from '../components/ClusterComponent';
import { NodeStatusCard } from '../components/NodeStatusCard';
import { Component } from '../models/Component';
import { Node } from '../models/Node';
import { Pod } from '../models/Pod';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';

export class ClusterStatus extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    clusterComponents: [],
    nodes: [] as Node[],
  };

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      this.setState({ currentClusterId: this.cluster?.instanceSettings.uid });
      this.loadAll();
      this.getClusterComponents();
    });

    this.getAvailableClusters().then((res) => {
      this.setState({ clusters: res });
    });
  }

  loadAll = async () => {
    await Promise.all([this.getNodes(), this.getPods()]);
    this.setState({ nodes: this.nodesMap, pageReady: true });
  };

  getClusterComponents() {
    this.cluster?.getComponents().then((components: any) => {
      if (components instanceof Array) {
        this.storeComponents = components.map((c: any) => new Component(c));
      }
      this.setState({ clusterComponents: this.storeComponents });
      setTimeout(() => this.getClusterComponents(), this.refreshRate);
    });
  }

  podsForNode(node: Node): Pod[] {
    return this.storePods.filter((p: Pod) => p.data.spec?.nodeName === node.name && !p.is_deleted);
  }

  render() {
    const { pageReady, nodes, clusterComponents } = this.state;
    const readyCount = nodes.filter((n) => n.ready).length;
    const clusterUid = this.cluster?.instanceSettings.uid;

    return (
      <PluginPage>
        <PageHeader
          active="status"
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
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.ClusterStatus}/${value}`;
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading cluster status..." />}

        {pageReady && (
          <>
            <div className={cx(this.styles.overviewPanel)}>
              <div className={cx(this.styles.header)}>
                <h1>
                  {this.cluster?.instanceSettings.name} — {readyCount}/{nodes.length} nodes ready
                </h1>
              </div>
              <div className={cx(this.styles.clusterComponents)}>
                <h2>Components</h2>
                {clusterComponents.length === 0 && <span style={{ color: '#8e8e8e' }}>No component statuses reported</span>}
                {clusterComponents.map((component: Component, i) => (
                  <ClusterComponent key={i} component={component} />
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                gap: '12px',
                marginTop: '12px',
              }}
            >
              {nodes.map((node) => (
                <NodeStatusCard key={node.name} node={node} pods={this.podsForNode(node)} clusterUid={clusterUid} />
              ))}
            </div>
          </>
        )}
      </PluginPage>
    );
  }
}
