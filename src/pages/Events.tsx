import React from 'react';
import { PluginPage, locationService } from '@grafana/runtime';
import { LoadingPlaceholder } from '@grafana/ui';
import { BasePage } from './BasePage';
import { PageHeader } from '../components/PageHeader';
import { EventsTable, KEvent } from '../components/EventsTable';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../constants';

function normalize(e: any, i: number): KEvent {
  const last =
    e.lastTimestamp || e.eventTime || e.series?.lastObservedTime || e.metadata?.creationTimestamp;
  const ms = last ? Date.parse(last) : 0;
  return {
    uid: e.metadata?.uid ?? (e.metadata?.name ? `${e.metadata?.namespace}/${e.metadata?.name}` : `evt-${i}`),
    type: e.type || 'Normal',
    reason: e.reason || '',
    message: (e.message || '').trim(),
    namespace: e.metadata?.namespace || e.involvedObject?.namespace || '',
    objectKind: e.involvedObject?.kind || '',
    objectName: e.involvedObject?.name || '',
    source: e.source?.component || e.reportingComponent || '',
    count: e.count ?? e.series?.count ?? 1,
    lastSeenMs: Number.isNaN(ms) ? 0 : ms,
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
  private mounted = true;

  constructor(props: any) {
    super(props);

    this.prepareDs().then(() => {
      if (!this.mounted) {
        return;
      }
      this.setState({ currentClusterId: this.cluster?.instanceSettings.uid });
      this.loadEvents();
    });

    this.getAvailableClusters().then((res) => {
      if (this.mounted) {
        this.setState({ clusters: res });
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  loadEvents = async () => {
    const raw = (await this.cluster?.getEvents()) ?? [];
    if (!this.mounted) {
      return;
    }
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
            services: this.generateServicesLink(),
            cost: this.generateCostLink(),
            edit: this.generateEditLink(),
            config: `/plugins/${APP_ID}`,
          }}
          onClusterChange={(value) => {
            locationService.push(`${PLUGIN_BASE_URL}/${ROUTES.Events}/${value}`);
          }}
        />

        {!pageReady && <LoadingPlaceholder text="Loading events..." />}
        {pageReady && <EventsTable events={events} />}
      </PluginPage>
    );
  }
}
