import React from 'react';
import { BasePage } from './BasePage';
import { Icon, ToolbarButton, ToolbarButtonRow } from '@grafana/ui';
import { PluginPage } from '@grafana/runtime';
import { cx } from '@emotion/css';
import { PageHeader } from '../components/PageHeader';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';
import { Namespace } from '../models/Namespace';
import { Component } from '../models/Component';
import { ClusterComponent } from '../components/ClusterComponent';
import store from '../common/store';
import { NamespaceCard } from '../components/NamespaceCard';

const startPanelsMap = {
  __overview: true,
};

export class ApplicationsOverview extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterName: '',
    currentClusterId: '',

    clusterComponents: [],
    namespacesMap: [],
    openPanels: new Map<string, boolean>(Object.entries(startPanelsMap)),
  };

  constructor(props: any) {
    super(props);
    this.prepareDs().then(() => {
      this.setState({
        currentClusterName: this.cluster?.instanceSettings.name,
        currentClusterId: this.cluster?.instanceSettings.uid,
      });
      this.getNamespacesMap().then(() => {
        this.setState({ pageReady: true });
      });

      this.getClusterComponents();
    });

    this.getAvailableClusters().then((res) => {
      this.setState({ clusters: res });
    });
  }

  getClusterComponents() {
    this.cluster?.getComponents().then((components: any) => {
      if (components instanceof Array) {
        this.componentsError = false;
        this.storeComponents = components.map((component: any) => new Component(component));
      } else {
        this.componentsError = components;
      }

      this.setState({ clusterComponents: this.storeComponents });

      setTimeout(() => this.getClusterComponents(), this.refreshRate);
    });
  }

  getNamespacesCount() {
    return this.state.namespacesMap.length;
  }

  getActiveNamespacesCount() {
    return this.state.namespacesMap.filter((item: Namespace) => item.open).length;
  }

  showAll = () => {
    this.toggleNamespaces(true);
  };

  hideAll = () => {
    this.toggleNamespaces(false);
  };

  namespaceClickHandler(e: any, namespace: Namespace) {
    if (e.ctrlKey || e.metaKey) {
      if (namespace.open) {
        e.preventDefault();
      }
      this.toggleNamespaces(namespace);
    } else {
      this.toggleOneNamespace(namespace);
    }
  }

  toggleNamespaces(namespace: boolean | Namespace) {
    store.delete('namespaceStore');
    let namespaceStore: any = [];
    this.namespacesMap.map((ns: Namespace) => {
      ns.open = namespace === true || namespace === false ? namespace : namespace.name === ns.name;
      namespaceStore.push({ name: ns.name, open: ns.open });
    });
    this.refreshNamespacesMapView();
    store.setObject('namespaceStore', namespaceStore);
  }

  toggleOneNamespace(namespace: Namespace) {
    namespace.toggle();
    this.refreshNamespacesMapView();
  }

  private refreshNamespacesMapView() {
    this.setState({ namespacesMap: [] }, () => {
      this.setState({ namespacesMap: this.namespacesMap });
    });
  }

  isPanelOpenClass(name: string) {
    if (this.state.openPanels.get(name) === undefined || this.state.openPanels.get(name) === true) {
      return 'active';
    } else {
      return 'disable';
    }
  }

  isPanelOpen(name: string) {
    return this.state.openPanels.get(name) === undefined || this.state.openPanels.get(name) === true;
  }

  togglePanel = (name: string) => (_e: any) => {
    let panels = this.state.openPanels;
    if (panels.get(name) === undefined || panels.get(name) === true) {
      panels.set(name, false);
    } else {
      panels.set(name, true);
    }
    this.setState({ openPanels: new Map<string, boolean>(Object.entries({ foo: false })) }, () =>
      this.setState({ openPanels: panels })
    );
  };

  render() {
    return (
      <PluginPage>
        <PageHeader
          active="apps"
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
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.ApplicationsOverview}/${value}`;
          }}
        />

        {this.state.pageReady && this.cluster && (
          <>
            <div className={cx(this.styles.overviewPanel)}>
              <div className={cx(this.styles.header)}>
                <div className={cx(this.styles.title)} onClick={this.togglePanel('__overview')}>
                  <Icon name={this.isPanelOpen('__overview') ? 'angle-down' : 'angle-right'} size="xl" />
                  <h1>Overview: {this.cluster?.instanceSettings.name}. Applications</h1>
                </div>
                <div className={cx(this.styles.overviewPanelBtn)}>
                  <span className={cx(this.styles.namespaceCounter, this.styles.overviewSpan)}>
                    <span className={'active'}>{this.getActiveNamespacesCount()}</span> / {this.getNamespacesCount()}
                  </span>
                  <span className={cx(this.styles.verticalLine, this.styles.overviewSpanLast)}></span>

                  <ToolbarButtonRow>
                    <ToolbarButton variant={'primary'} onClick={this.showAll}>
                      Show all
                    </ToolbarButton>
                    <ToolbarButton
                      variant={'primary'}
                      onClick={this.hideAll}
                      icon={'question-circle'}
                      tooltip={'Use Ctrl+Click or ⌘+Click to select only one Namespace'}
                    >
                      Hide all
                    </ToolbarButton>
                  </ToolbarButtonRow>
                </div>
              </div>

              {this.isPanelOpen('__overview') && (
                <div className={cx(this.styles.overviewPanelBody)}>
                  <div className={cx(this.styles.clusterComponents)}>
                    <h2>Components</h2>
                    {this.state.clusterComponents.map((component: Component, i) => (
                      <ClusterComponent key={i} component={component} />
                    ))}
                  </div>
                  <div className={cx(this.styles.clusterNamespaces)}>
                    {this.state.namespacesMap
                      .filter((namespace: Namespace) => !namespace.is_deleted)
                      .map((namespace: Namespace) => (
                        <div key={namespace.name} className={cx(this.styles.checkboxContainer)}>
                          <input
                            type="checkbox"
                            id={'namespace_' + namespace.name}
                            checked={namespace.open}
                            onChange={() => {}}
                            onClick={(e) => {
                              this.namespaceClickHandler(e, namespace);
                            }}
                          />
                          <span />
                          <label htmlFor={'namespace_' + namespace.name}>{namespace.name}</label>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {this.state.namespacesMap
              .filter((namespace: Namespace) => !namespace.is_deleted)
              .map(
                (ns: Namespace) =>
                  ns.open && (
                    <NamespaceCard
                      key={ns.name}
                      namespace={ns}
                      clusterName={this.cluster?.name}
                      isPanelOpen={this.isPanelOpen(ns.name)}
                    />
                  )
              )}
          </>
        )}
      </PluginPage>
    );
  }
}
