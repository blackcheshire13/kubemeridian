import { detectCloud } from './prices';
import { allocateNamespaceCosts, priceNode } from './pricing';

const GiB = 1024 ** 3;

describe('detectCloud', () => {
  it('maps provider id schemes', () => {
    expect(detectCloud('aws:///us-east-1a/i-0abc')).toBe('aws');
    expect(detectCloud('gce://proj/us-central1-a/inst')).toBe('gcp');
    expect(detectCloud('azure:///subscriptions/x/vm')).toBe('azure');
    expect(detectCloud('digitalocean://554197414')).toBe('digitalocean');
    expect(detectCloud(undefined)).toBe('onprem');
    expect(detectCloud('weird://x')).toBe('unknown');
  });
});

describe('priceNode tiers', () => {
  it('Tier 0 uses OpenCost hourly verbatim', () => {
    const n = priceNode({ node: 'a', providerId: 'aws://x', vcpu: 4, memBytes: 16 * GiB, openCostHourly: 0.5 });
    expect(n.tier).toBe(0);
    expect(n.hourly).toBe(0.5);
    expect(n.cpuHourly + n.ramHourly).toBeCloseTo(0.5, 5);
  });

  it('Tier 1 uses the catalog by instance type (DO droplet)', () => {
    const n = priceNode({ node: 'a', providerId: 'digitalocean://1', instanceType: 's-4vcpu-8gb', vcpu: 4, memBytes: 8 * GiB });
    expect(n.tier).toBe(1);
    expect(n.hourly).toBeCloseTo(0.07143, 5);
  });

  it('Tier 1 honors the region multiplier', () => {
    const n = priceNode({ node: 'a', providerId: 'aws://x', instanceType: 'm5.large', region: 'sa-east-1', vcpu: 2, memBytes: 8 * GiB });
    expect(n.tier).toBe(1);
    expect(n.hourly).toBeCloseTo(0.096 * 1.6, 4);
  });

  it('Tier 2 per-cloud flat when instance type unknown', () => {
    const n = priceNode({ node: 'a', providerId: 'digitalocean://1', vcpu: 4, memBytes: 8 * GiB });
    expect(n.tier).toBe(2);
    expect(n.hourly).toBeCloseTo(4 * 0.009 + 8 * 0.0045, 5);
  });

  it('Tier 3 global flat for on-prem/unknown', () => {
    const n = priceNode({ node: 'a', vcpu: 2, memBytes: 4 * GiB });
    expect(n.tier).toBe(3);
    expect(n.hourly).toBeCloseTo(2 * 0.031 + 4 * 0.004, 5);
  });
});

describe('allocateNamespaceCosts', () => {
  const nodes = [
    priceNode({ node: 'n1', providerId: 'digitalocean://1', instanceType: 's-4vcpu-8gb', vcpu: 4, memBytes: 8 * GiB }),
    priceNode({ node: 'n2', providerId: 'digitalocean://2', instanceType: 's-4vcpu-8gb', vcpu: 4, memBytes: 8 * GiB }),
  ];
  // capacity: 8 vCPU, 16 GiB. requests below are half → ~half allocated, half idle.
  const ns = [
    { namespace: 'a', cpu: 2, memBytes: 4 * GiB, cpuUsage: 1, memUsage: 2 * GiB },
    { namespace: 'b', cpu: 2, memBytes: 4 * GiB },
  ];

  it('allocates by capacity share and surfaces idle', () => {
    const c = allocateNamespaceCosts(nodes, ns);
    expect(c.totalMonthly).toBeCloseTo(2 * 0.07143 * 730, 2);
    // half the capacity is requested → ~half is idle
    expect(c.allocatedMonthly).toBeCloseTo(c.totalMonthly / 2, 2);
    expect(c.idleMonthly).toBeCloseTo(c.totalMonthly / 2, 2);
    expect(c.items[0].cpuEff).toBeCloseTo(0.5, 5);
    expect(c.items.every((i) => i.share >= 0 && i.share <= 1)).toBe(true);
  });
});
