import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { ErrorBoundaryAlert } from '@grafana/ui';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { ClustersListPage } from '../../pages/ClustersList';
import { NodesOverviewPage } from '../../pages/NodesOverview';
import { ApplicationsOverview } from '../../pages/ApplicationsOverview';
import { ClusterStatus } from '../../pages/ClusterStatus';
import { EventsPage } from '../../pages/Events';
import { LogsPage } from '../../pages/Logs';
import { TracesPage } from '../../pages/Traces';
import { ServicesPage } from '../../pages/Services';
import { CostPage } from '../../pages/Cost';
import { organizeDashboardsIntoFolder } from '../../common/dashboards';

function NodesRoute() {
  const { clusterId = '' } = useParams();
  return <NodesOverviewPage key={clusterId} cluster_id={clusterId} />;
}

function EventsRoute() {
  const { clusterId = '' } = useParams();
  return <EventsPage key={clusterId} cluster_id={clusterId} />;
}

function LogsRoute() {
  const { clusterId = '' } = useParams();
  return <LogsPage key={clusterId} cluster_id={clusterId} />;
}

function TracesRoute() {
  const { clusterId = '' } = useParams();
  return <TracesPage key={clusterId} cluster_id={clusterId} />;
}

function ServicesRoute() {
  const { clusterId = '' } = useParams();
  return <ServicesPage key={clusterId} cluster_id={clusterId} />;
}

function CostRoute() {
  const { clusterId = '' } = useParams();
  return <CostPage key={clusterId} cluster_id={clusterId} />;
}

function ApplicationsRoute() {
  const { clusterId = '' } = useParams();
  return <ApplicationsOverview key={clusterId} cluster_id={clusterId} />;
}

function ClusterStatusRoute() {
  const { clusterId = '' } = useParams();
  return <ClusterStatus key={clusterId} cluster_id={clusterId} />;
}

function App(_props: AppRootProps) {
  // Group the bundled dashboards under a "KubeMeridian" folder (best-effort, idempotent).
  React.useEffect(() => {
    organizeDashboardsIntoFolder();
  }, []);

  return (
    <ErrorBoundaryAlert style="page" title="KubeMeridian ran into an unexpected error">
      <Routes>
        <Route path={`${ROUTES.NodesOverview}/:clusterId`} element={<NodesRoute />} />
        <Route path={`${ROUTES.Events}/:clusterId`} element={<EventsRoute />} />
        <Route path={`${ROUTES.Logs}/:clusterId`} element={<LogsRoute />} />
        <Route path={`${ROUTES.Traces}/:clusterId`} element={<TracesRoute />} />
        <Route path={`${ROUTES.Services}/:clusterId`} element={<ServicesRoute />} />
        <Route path={`${ROUTES.Cost}/:clusterId`} element={<CostRoute />} />
        <Route path={`${ROUTES.ApplicationsOverview}/:clusterId`} element={<ApplicationsRoute />} />
        <Route path={`${ROUTES.ClusterStatus}/:clusterId`} element={<ClusterStatusRoute />} />
        <Route path={ROUTES.Clusters} element={<ClustersListPage />} />
        {/* Default page */}
        <Route path="*" element={<ClustersListPage />} />
      </Routes>
    </ErrorBoundaryAlert>
  );
}

export default App;
