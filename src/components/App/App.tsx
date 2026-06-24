import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { ClustersListPage } from '../../pages/ClustersList';
import { NodesOverviewPage } from '../../pages/NodesOverview';
import { ApplicationsOverview } from '../../pages/ApplicationsOverview';
import { ClusterStatus } from '../../pages/ClusterStatus';
import { EventsPage } from '../../pages/Events';
import { LogsPage } from '../../pages/Logs';
import { TracesPage } from '../../pages/Traces';

function NodesRoute() {
  const { clusterId = '' } = useParams();
  return <NodesOverviewPage cluster_id={clusterId} />;
}

function EventsRoute() {
  const { clusterId = '' } = useParams();
  return <EventsPage cluster_id={clusterId} />;
}

function LogsRoute() {
  const { clusterId = '' } = useParams();
  return <LogsPage cluster_id={clusterId} />;
}

function TracesRoute() {
  const { clusterId = '' } = useParams();
  return <TracesPage cluster_id={clusterId} />;
}

function ApplicationsRoute() {
  const { clusterId = '' } = useParams();
  return <ApplicationsOverview cluster_id={clusterId} />;
}

function ClusterStatusRoute() {
  const { clusterId = '' } = useParams();
  return <ClusterStatus cluster_id={clusterId} />;
}

function App(_props: AppRootProps) {
  return (
    <Routes>
      <Route path={`${ROUTES.NodesOverview}/:clusterId`} element={<NodesRoute />} />
      <Route path={`${ROUTES.Events}/:clusterId`} element={<EventsRoute />} />
      <Route path={`${ROUTES.Logs}/:clusterId`} element={<LogsRoute />} />
      <Route path={`${ROUTES.Traces}/:clusterId`} element={<TracesRoute />} />
      <Route path={`${ROUTES.ApplicationsOverview}/:clusterId`} element={<ApplicationsRoute />} />
      <Route path={`${ROUTES.ClusterStatus}/:clusterId`} element={<ClusterStatusRoute />} />
      <Route path={ROUTES.Clusters} element={<ClustersListPage />} />
      {/* Default page */}
      <Route path="*" element={<ClustersListPage />} />
    </Routes>
  );
}

export default App;
