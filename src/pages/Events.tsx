import React from 'react';
import { PluginPage } from '@grafana/runtime';
import { LoadingPlaceholder } from '@grafana/ui';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { EventsTable, KEvent } from '../components/EventsTable';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';

function normalize(e: any): KEvent {
  const last =
    e.lastTimestamp || e.eventTime || e.series?.lastObservedTime || e.metadata?.creationTimestamp;
  return {
    uid: e.metadata?.uid ?? `${e.metadata?.namespace}/${e.metadata?.name}`,
    type: e.type || 'Normal',
    reason: e.reason || '',
    message: (e.message || '').trim(),
    namespace: e.metadata?.namespace || e.involvedObject?.namespace || '',
    objectKind: e.involvedObject?.kind || '',
    objectName: e.involvedObject?.name || '',
    source: e.source?.component || e.reportingComponent || '',
    count: e.count ?? e.series?.count ?? 1,
    lastSeenMs: last ? Date.parse(last) : 0,
  };
}

export class EventsPage extends BasePage {
  state = {
    pageReady: false,
    clusters: [],
    currentClusterId: '',
    events: [] as KEvent[],
  };

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      this.setState({ currentClusterId: this.cluster?.instanceSettings.uid });
      this.loadEvents();
    });

    this.getAvailableClusters().then((res) => {
      this.setState({ clusters: res });
    });
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  loadEvents = async () => {
    const raw = (await this.cluster?.getEvents()) ?? [];
    this.setState({ events: raw.map(normalize), pageReady: true });
    this.timer = setTimeout(this.loadEvents, this.refreshRate);
  };

  render() {
    const { events, pageReady } = this.state;

    return (
      <PluginPage>
        <PageHeader
          active="events"
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
            window.location.href = `${PLUGIN_BASE_URL}/${ROUTES.Events}/${value}`;
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading events..." />}
        {pageReady && <EventsTable events={events} />}
      </PluginPage>
    );
  }
}
