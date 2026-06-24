import { createContext } from 'react';

export interface PodLogsApi {
  show: (namespace: string, pod: string) => void;
}

// Provided by topology pages when the cluster has a Loki datasource linked.
// PodCard consumes it to offer an inline "logs" action without prop drilling.
export const PodLogsContext = createContext<PodLogsApi | null>(null);
