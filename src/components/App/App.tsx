import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { ClustersListPage } from '../../pages/ClustersList';
import { NodesOverviewPage } from '../../pages/NodesOverview';
import { ApplicationsOverview } from '../../pages/ApplicationsOverview';
import { ClusterStatus } from '../../pages/ClusterStatus';

function NodesRoute() {
  const { clusterId = '' } = useParams();
  return <NodesOverviewPage cluster_id={clusterId} />;
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
      <Route path={`${ROUTES.ApplicationsOverview}/:clusterId`} element={<ApplicationsRoute />} />
      <Route path={`${ROUTES.ClusterStatus}/:clusterId`} element={<ClusterStatusRoute />} />
      <Route path={ROUTES.Clusters} element={<ClustersListPage />} />
      {/* Default page */}
      <Route path="*" element={<ClustersListPage />} />
    </Routes>
  );
}

export default App;
