import React from 'react';
import { BasePage } from './BasePage';
import { PluginPage } from '@grafana/runtime';
import { LoadingPlaceholder } from '@grafana/ui';
import { PageHeader } from '../components/PageHeader';
import { NodeCard } from '../components/NodeCard';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { Node } from '../models/Node';
import { Pod } from '../models/Pod';
import { parseCpu, parseMemory } from '../common/resources';

interface NodeStat {
  node: Node;
  podCount: number;
  reqCpu: number;
  reqMem: number;
}

export class NodesOverviewPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    nodeStats: [] as NodeStat[],
  };

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      this.setState({ currentClusterId: this.cluster?.instanceSettings.uid });
      this.loadNodes();
    });

    this.getAvailableClusters().then((res) => {
      this.setState({ clusters: res });
    });
  }

  loadNodes = async () => {
    await Promise.all([this.getNodes(), this.getPods()]);

    const stats: NodeStat[] = this.nodesMap.map((node) => {
      const podsOnNode = this.storePods.filter(
        (p: Pod) => p.data.spec?.nodeName === node.name && !p.is_deleted
      );
      let reqCpu = 0;
      let reqMem = 0;
      podsOnNode.forEach((p: Pod) => {
        (p.data.spec?.containers || []).forEach((c: any) => {
          reqCpu += parseCpu(c.resources?.requests?.cpu);
          reqMem += parseMemory(c.resources?.requests?.memory);
        });
      });
      return { node, podCount: podsOnNode.length, reqCpu, reqMem };
    });

    this.setState({ nodeStats: stats, pageReady: true });
  };

  render() {
    const { nodeStats, pageReady } = this.state;
    const readyCount = nodeStats.filter((s) => s.node.ready).length;

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
            events: this.generateEventsLink(),
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.NodesOverview}/${value}`;
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading nodes..." />}

        {pageReady && (
          <>
            <h2>
              Overview: {this.cluster?.instanceSettings.name}. Nodes — {readyCount}/{nodeStats.length} ready
            </h2>
            {nodeStats.map((s) => (
              <NodeCard
                key={s.node.name}
                node={s.node}
                podCount={s.podCount}
                reqCpu={s.reqCpu}
                reqMem={s.reqMem}
                clusterName={this.cluster?.name}
                dashboardUid="kubegraf-node"
              />
            ))}
          </>
        )}
      </PluginPage>
    );
  }
}
