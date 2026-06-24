// Pure pricing engine for the Cost Explorer. No I/O — fed parsed Prometheus data.
import {
  CLOUD_FLAT,
  CloudId,
  GLOBAL_FLAT,
  NodePrice,
  PRICE_CATALOG,
  REGION_MULTIPLIER,
  detectCloud,
} from './prices';

export const HOURS_PER_MONTH = 730;

export type CostTier = 0 | 1 | 2 | 3;
export const TIER_LABEL: Record<CostTier, string> = {
  0: 'OpenCost',
  1: 'Catalog',
  2: 'Cloud estimate',
  3: 'Flat estimate',
};

export interface NodeInput {
  node: string;
  providerId?: string;
  instanceType?: string;
  region?: string;
  vcpu: number;
  memBytes: number;
  /** node_total_hourly_cost when OpenCost is present. */
  openCostHourly?: number;
}

export interface NodeCost {
  node: string;
  cloud: CloudId;
  instanceType?: string;
  vcpu: number;
  memGiB: number;
  hourly: number;
  monthly: number;
  cpuHourly: number;
  ramHourly: number;
  tier: CostTier;
}

function regionMult(region?: string): number {
  if (!region) {
    return 1;
  }
  for (const r of REGION_MULTIPLIER) {
    if (r.match.test(region)) {
      return r.mult;
    }
  }
  return 1;
}

function catalogLookup(cloud: CloudId, instanceType?: string): NodePrice | undefined {
  if (!instanceType) {
    return undefined;
  }
  const list = PRICE_CATALOG[cloud];
  const it = instanceType.toLowerCase();
  return list?.find((p) => p.type.toLowerCase() === it);
}

/** Resolve a node's cost using the best available tier. */
export function priceNode(n: NodeInput): NodeCost {
  const cloud = detectCloud(n.providerId);
  const memGiB = n.memBytes / 1024 ** 3;
  let hourly: number;
  let tier: CostTier;

  if (typeof n.openCostHourly === 'number' && n.openCostHourly > 0) {
    hourly = n.openCostHourly;
    tier = 0;
  } else {
    const hit = catalogLookup(cloud, n.instanceType);
    if (hit) {
      hourly = hit.usdHr * regionMult(n.region);
      tier = 1;
    } else if (CLOUD_FLAT[cloud]) {
      const f = CLOUD_FLAT[cloud];
      hourly = (n.vcpu * f.cpuHr + memGiB * f.ramHrGiB) * regionMult(n.region);
      tier = 2;
    } else {
      hourly = n.vcpu * GLOBAL_FLAT.cpuHr + memGiB * GLOBAL_FLAT.ramHrGiB;
      tier = 3;
    }
  }

  // Split into CPU vs RAM portions (proportional to a flat baseline) so namespace
  // allocation can attribute compute- and memory-driven cost separately.
  const base = CLOUD_FLAT[cloud] ?? GLOBAL_FLAT;
  const cpuW = n.vcpu * base.cpuHr;
  const ramW = memGiB * base.ramHrGiB;
  const wsum = cpuW + ramW || 1;

  return {
    node: n.node,
    cloud,
    instanceType: n.instanceType,
    vcpu: n.vcpu,
    memGiB,
    hourly,
    monthly: hourly * HOURS_PER_MONTH,
    cpuHourly: hourly * (cpuW / wsum),
    ramHourly: hourly * (ramW / wsum),
    tier,
  };
}

export interface NsAlloc {
  namespace: string;
  cpu: number; // requested cores
  memBytes: number; // requested bytes
  cpuUsage?: number; // used cores
  memUsage?: number; // used bytes
}

export interface NsCost {
  namespace: string;
  cpuReq: number;
  memReqGiB: number;
  monthly: number;
  share: number;
  cpuEff?: number;
  memEff?: number;
}

export interface ClusterCost {
  items: NsCost[];
  totalMonthly: number;
  allocatedMonthly: number;
  idleMonthly: number;
  cpuMonthly: number;
  ramMonthly: number;
}

/**
 * Allocate node cost to namespaces by their share of cluster CAPACITY (so the
 * unrequested remainder surfaces as idle). Allocation amount = requests.
 */
export function allocateNamespaceCosts(nodes: NodeCost[], ns: NsAlloc[]): ClusterCost {
  const cpuMonthly = nodes.reduce((a, n) => a + n.cpuHourly, 0) * HOURS_PER_MONTH;
  const ramMonthly = nodes.reduce((a, n) => a + n.ramHourly, 0) * HOURS_PER_MONTH;
  const totalMonthly = nodes.reduce((a, n) => a + n.monthly, 0);
  const capCpu = nodes.reduce((a, n) => a + n.vcpu, 0) || 1;
  const capMem = nodes.reduce((a, n) => a + n.memGiB * 1024 ** 3, 0) || 1;

  const items: NsCost[] = ns.map((x) => {
    const monthly = (x.cpu / capCpu) * cpuMonthly + (x.memBytes / capMem) * ramMonthly;
    return {
      namespace: x.namespace,
      cpuReq: x.cpu,
      memReqGiB: x.memBytes / 1024 ** 3,
      monthly,
      share: totalMonthly > 0 ? monthly / totalMonthly : 0,
      cpuEff: x.cpuUsage != null && x.cpu > 0 ? x.cpuUsage / x.cpu : undefined,
      memEff: x.memUsage != null && x.memBytes > 0 ? x.memUsage / x.memBytes : undefined,
    };
  });
  items.sort((a, b) => b.monthly - a.monthly);

  const allocatedMonthly = items.reduce((a, i) => a + i.monthly, 0);
  return {
    items,
    totalMonthly,
    allocatedMonthly,
    idleMonthly: Math.max(0, totalMonthly - allocatedMonthly),
    cpuMonthly,
    ramMonthly,
  };
}
