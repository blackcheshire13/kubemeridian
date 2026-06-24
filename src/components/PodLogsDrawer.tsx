import React, { useMemo } from 'react';
import { Drawer } from '@grafana/ui';
import { buildLogsScene } from '../scenes/logs';

interface Props {
  namespace: string;
  pod: string;
  logsUid: string;
  onClose: () => void;
}

export function PodLogsDrawer({ namespace, pod, logsUid, onClose }: Props) {
  const scene = useMemo(() => buildLogsScene({ logsUid, namespace, pod }), [logsUid, namespace, pod]);

  return (
    <Drawer title={`Logs — ${namespace}/${pod}`} subtitle="Loki" size="lg" onClose={onClose}>
      <scene.Component model={scene} />
    </Drawer>
  );
}
