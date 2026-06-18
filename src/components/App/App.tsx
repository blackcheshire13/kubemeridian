import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { ROUTES } from '../../constants';
import { ClustersListPage } from '../../pages/ClustersList';
import { NodesOverviewPage } from '../../pages/NodesOverview';
import { ApplicationsOverview } from '../../pages/ApplicationsOverview';

function NodesRoute() {
  const { clusterId = '' } = useParams();
  return <NodesOverviewPage cluster_id={clusterId} />;
}

function ApplicationsRoute() {
  const { clusterId = '' } = useParams();
  return <ApplicationsOverview cluster_id={clusterId} />;
}

function App(_props: AppRootProps) {
  return (
    <Routes>
      <Route path={`${ROUTES.NodesOverview}/:clusterId`} element={<NodesRoute />} />
      <Route path={`${ROUTES.ApplicationsOverview}/:clusterId`} element={<ApplicationsRoute />} />
      {/* Cluster status reuses the applications overview until a dedicated page exists */}
      <Route path={`${ROUTES.ClusterStatus}/:clusterId`} element={<ApplicationsRoute />} />
      <Route path={ROUTES.Clusters} element={<ClustersListPage />} />
      {/* Default page */}
      <Route path="*" element={<ClustersListPage />} />
    </Routes>
  );
}

export default App;
