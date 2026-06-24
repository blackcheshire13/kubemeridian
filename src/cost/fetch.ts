import { getBackendSrv } from '@grafana/runtime';
import { CLOUD_LABEL, CloudId } from './prices';
import { ClusterCost, NodeCost, NsAlloc, allocateNamespaceCosts, priceNode } from './pricing';

interface Sample {
  metric: Record<string, string>;
  value: number;
}

async function instant(uid: string, query: string): Promise<Sample[]> {
  try {
    const res: any = await getBackendSrv().get(`/api/datasources/uid/${uid}/resources/api/v1/query`, { query });
    const result = res?.data?.result ?? [];
    return result.map((r: any) => ({ metric: r.metric ?? {}, value: Number(r.value?.[1] ?? 0) }));
  } catch {
    return [];
  }
}

const byNode = (rows: Sample[], key = 'node') => {
  const m: Record<string, number> = {};
  for (const r of rows) {
    const n = r.metric[key];
    if (n) {
      m[n] = r.value;
    }
  }
  return m;
};

const NOPOD = 'container!="", container!="POD"';

export interface CloudGroup {
  cloud: CloudId;
  label: string;
  nodes: number;
  monthly: number;
}

export interface CostModel {
  nodes: NodeCost[];
  cluster: ClusterCost;
  openCost: boolean;
  hasInstanceTypes: boolean;
  byCloud: CloudGroup[];
  tiers: Record<number, number>; // tier -> node count
}

/** Query Prometheus and assemble the full cost model for the linked metrics DS. */
export async function fetchCostModel(metricsUid: string): Promise<CostModel> {
  const [cpuCap, memCap, info, labels, ocNode, nsCpuReq, nsMemReq, nsCpuUse, nsMemUse, ocPresent] = await Promise.all([
    instant(metricsUid, 'kube_node_status_capacity{resource="cpu"}'),
    instant(metricsUid, 'kube_node_status_capacity{resource="memory"}'),
    instant(metricsUid, 'kube_node_info'),
    instant(metricsUid, 'kube_node_labels'),
    instant(metricsUid, 'node_total_hourly_cost'),
    instant(metricsUid, 'sum by (namespace)(kube_pod_container_resource_requests{resource="cpu"})'),
    instant(metricsUid, 'sum by (namespace)(kube_pod_container_resource_requests{resource="memory"})'),
    instant(metricsUid, `sum by (namespace)(rate(container_cpu_usage_seconds_total{${NOPOD}}[5m]))`),
    instant(metricsUid, `sum by (namespace)(container_memory_working_set_bytes{${NOPOD}})`),
    instant(metricsUid, 'count(node_total_hourly_cost)'),
  ]);

  const cpu = byNode(cpuCap);
  const mem = byNode(memCap);
  const oc = byNode(ocNode);
  const providerById: Record<string, string> = {};
  for (const r of info) {
    if (r.metric.node) {
      providerById[r.metric.node] = r.metric.provider_id ?? '';
    }
  }
  const labelByNode: Record<string, Record<string, string>> = {};
  for (const r of labels) {
    if (r.metric.node) {
      labelByNode[r.metric.node] = r.metric;
    }
  }

  const openCost = ocPresent.length > 0 && ocPresent[0].value > 0;
  let hasInstanceTypes = false;

  const nodes: NodeCost[] = Object.keys(cpu).map((node) => {
    const lbl = labelByNode[node] ?? {};
    const instanceType =
      lbl.label_node_kubernetes_io_instance_type || lbl.label_beta_kubernetes_io_instance_type || undefined;
    const region = lbl.label_topology_kubernetes_io_region || undefined;
    if (instanceType) {
      hasInstanceTypes = true;
    }
    return priceNode({
      node,
      providerId: providerById[node],
      instanceType,
      region,
      vcpu: cpu[node] ?? 0,
      memBytes: mem[node] ?? 0,
      openCostHourly: openCost ? oc[node] : undefined,
    });
  });

  // namespace allocations
  const cpuReq = byNode(nsCpuReq, 'namespace');
  const memReq = byNode(nsMemReq, 'namespace');
  const cpuUse = byNode(nsCpuUse, 'namespace');
  const memUse = byNode(nsMemUse, 'namespace');
  const nsNames = new Set([...Object.keys(cpuReq), ...Object.keys(memReq)]);
  const ns: NsAlloc[] = [...nsNames].map((namespace) => ({
    namespace,
    cpu: cpuReq[namespace] ?? 0,
    memBytes: memReq[namespace] ?? 0,
    cpuUsage: cpuUse[namespace],
    memUsage: memUse[namespace],
  }));

  const cluster = allocateNamespaceCosts(nodes, ns);

  // group by cloud
  const groups: Record<string, CloudGroup> = {};
  const tiers: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const n of nodes) {
    tiers[n.tier] = (tiers[n.tier] ?? 0) + 1;
    const g = (groups[n.cloud] ??= { cloud: n.cloud, label: CLOUD_LABEL[n.cloud], nodes: 0, monthly: 0 });
    g.nodes += 1;
    g.monthly += n.monthly;
  }

  return {
    nodes: nodes.sort((a, b) => b.monthly - a.monthly),
    cluster,
    openCost,
    hasInstanceTypes,
    byCloud: Object.values(groups).sort((a, b) => b.monthly - a.monthly),
    tiers,
  };
}
