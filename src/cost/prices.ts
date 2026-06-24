// Bundled node price catalog for the Cost Explorer's no-OpenCost path.
//
// APPROXIMATE on-demand, Linux, US region, compute-only (excludes storage / egress
// / LB / licensing and all reserved/spot discounts). Captured 2026-06-24 — refresh
// quarterly. Keys are the node `instance-type` label values as exposed by each
// cloud (Azure keeps its `Standard_` prefix; DO uses the droplet slug).
//
// Tiers (see pricing.ts): 0 OpenCost · 1 this catalog by instance type ·
// 2 per-cloud flat $/vCPU+$/GiB · 3 global flat.

export const CATALOG_DATE = '2026-06-24';

export interface NodePrice {
  type: string;
  vcpu: number;
  memGiB: number;
  usdHr: number;
}

export type CloudId = 'aws' | 'gcp' | 'azure' | 'digitalocean' | 'hcloud' | 'linode' | 'oci' | 'onprem' | 'unknown';

export const CLOUD_LABEL: Record<CloudId, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
  digitalocean: 'DigitalOcean',
  hcloud: 'Hetzner',
  linode: 'Linode',
  oci: 'Oracle Cloud',
  onprem: 'On-prem',
  unknown: 'Unknown',
};

// providerID scheme → cloud id.
export function detectCloud(providerId?: string): CloudId {
  if (!providerId) {
    return 'onprem';
  }
  const scheme = providerId.split(':')[0].toLowerCase();
  switch (scheme) {
    case 'aws':
      return 'aws';
    case 'gce':
      return 'gcp';
    case 'azure':
      return 'azure';
    case 'digitalocean':
      return 'digitalocean';
    case 'hcloud':
      return 'hcloud';
    case 'linode':
      return 'linode';
    case 'oci':
      return 'oci';
    default:
      return scheme ? 'unknown' : 'onprem';
  }
}

export const PRICE_CATALOG: Partial<Record<CloudId, NodePrice[]>> = {
  aws: [
    { type: 't3.medium', vcpu: 2, memGiB: 4, usdHr: 0.0416 },
    { type: 't3.large', vcpu: 2, memGiB: 8, usdHr: 0.0832 },
    { type: 't3.xlarge', vcpu: 4, memGiB: 16, usdHr: 0.1664 },
    { type: 'm5.large', vcpu: 2, memGiB: 8, usdHr: 0.096 },
    { type: 'm5.xlarge', vcpu: 4, memGiB: 16, usdHr: 0.192 },
    { type: 'm5.2xlarge', vcpu: 8, memGiB: 32, usdHr: 0.384 },
    { type: 'm5.4xlarge', vcpu: 16, memGiB: 64, usdHr: 0.768 },
    { type: 'm6i.large', vcpu: 2, memGiB: 8, usdHr: 0.096 },
    { type: 'm6i.xlarge', vcpu: 4, memGiB: 16, usdHr: 0.192 },
    { type: 'c5.large', vcpu: 2, memGiB: 4, usdHr: 0.085 },
    { type: 'c5.xlarge', vcpu: 4, memGiB: 8, usdHr: 0.17 },
    { type: 'c6i.large', vcpu: 2, memGiB: 4, usdHr: 0.085 },
    { type: 'r5.large', vcpu: 2, memGiB: 16, usdHr: 0.126 },
    { type: 'r5.xlarge', vcpu: 4, memGiB: 32, usdHr: 0.252 },
  ],
  gcp: [
    { type: 'e2-medium', vcpu: 2, memGiB: 4, usdHr: 0.0335 },
    { type: 'e2-standard-2', vcpu: 2, memGiB: 8, usdHr: 0.067 },
    { type: 'e2-standard-4', vcpu: 4, memGiB: 16, usdHr: 0.134 },
    { type: 'e2-standard-8', vcpu: 8, memGiB: 32, usdHr: 0.268 },
    { type: 'e2-highmem-2', vcpu: 2, memGiB: 16, usdHr: 0.0904 },
    { type: 'n1-standard-1', vcpu: 1, memGiB: 3.75, usdHr: 0.0475 },
    { type: 'n1-standard-2', vcpu: 2, memGiB: 7.5, usdHr: 0.095 },
    { type: 'n1-standard-4', vcpu: 4, memGiB: 15, usdHr: 0.19 },
    { type: 'n2-standard-2', vcpu: 2, memGiB: 8, usdHr: 0.0971 },
    { type: 'n2-standard-4', vcpu: 4, memGiB: 16, usdHr: 0.1942 },
    { type: 'n2-standard-8', vcpu: 8, memGiB: 32, usdHr: 0.3885 },
    { type: 'n2d-standard-4', vcpu: 4, memGiB: 16, usdHr: 0.169 },
    { type: 'c2-standard-4', vcpu: 4, memGiB: 16, usdHr: 0.2088 },
  ],
  azure: [
    { type: 'Standard_B2s', vcpu: 2, memGiB: 4, usdHr: 0.0416 },
    { type: 'Standard_B2ms', vcpu: 2, memGiB: 8, usdHr: 0.0832 },
    { type: 'Standard_B4ms', vcpu: 4, memGiB: 16, usdHr: 0.166 },
    { type: 'Standard_D2s_v3', vcpu: 2, memGiB: 8, usdHr: 0.096 },
    { type: 'Standard_D4s_v3', vcpu: 4, memGiB: 16, usdHr: 0.192 },
    { type: 'Standard_D8s_v3', vcpu: 8, memGiB: 32, usdHr: 0.384 },
    { type: 'Standard_D2s_v5', vcpu: 2, memGiB: 8, usdHr: 0.096 },
    { type: 'Standard_D4s_v5', vcpu: 4, memGiB: 16, usdHr: 0.192 },
    { type: 'Standard_D2as_v5', vcpu: 2, memGiB: 8, usdHr: 0.086 },
    { type: 'Standard_F2s_v2', vcpu: 2, memGiB: 4, usdHr: 0.0846 },
    { type: 'Standard_F4s_v2', vcpu: 4, memGiB: 8, usdHr: 0.169 },
    { type: 'Standard_E2s_v3', vcpu: 2, memGiB: 16, usdHr: 0.126 },
    { type: 'Standard_E4s_v3', vcpu: 4, memGiB: 32, usdHr: 0.252 },
  ],
  digitalocean: [
    { type: 's-1vcpu-2gb', vcpu: 1, memGiB: 2, usdHr: 0.01786 },
    { type: 's-2vcpu-2gb', vcpu: 2, memGiB: 2, usdHr: 0.02679 },
    { type: 's-2vcpu-4gb', vcpu: 2, memGiB: 4, usdHr: 0.03571 },
    { type: 's-4vcpu-8gb', vcpu: 4, memGiB: 8, usdHr: 0.07143 },
    { type: 's-8vcpu-16gb', vcpu: 8, memGiB: 16, usdHr: 0.14286 },
    { type: 'g-2vcpu-8gb', vcpu: 2, memGiB: 8, usdHr: 0.09375 },
    { type: 'g-4vcpu-16gb', vcpu: 4, memGiB: 16, usdHr: 0.1875 },
    { type: 'g-8vcpu-32gb', vcpu: 8, memGiB: 32, usdHr: 0.375 },
    { type: 'c-2', vcpu: 2, memGiB: 4, usdHr: 0.0625 },
    { type: 'c-4', vcpu: 4, memGiB: 8, usdHr: 0.125 },
    { type: 'c-8', vcpu: 8, memGiB: 16, usdHr: 0.25 },
  ],
};

// Tier-2 fallback: per-cloud flat rates ($/vCPU-hr, $/GiB-hr), derived from the
// catalog medians. Used when the cloud is known but the instance type isn't.
export const CLOUD_FLAT: Record<string, { cpuHr: number; ramHrGiB: number }> = {
  aws: { cpuHr: 0.031, ramHrGiB: 0.004 },
  gcp: { cpuHr: 0.0316, ramHrGiB: 0.0042 },
  azure: { cpuHr: 0.031, ramHrGiB: 0.004 },
  digitalocean: { cpuHr: 0.009, ramHrGiB: 0.0045 },
  hcloud: { cpuHr: 0.006, ramHrGiB: 0.002 },
  linode: { cpuHr: 0.009, ramHrGiB: 0.004 },
  oci: { cpuHr: 0.02, ramHrGiB: 0.003 },
};

// Tier-3 last resort.
export const GLOBAL_FLAT = { cpuHr: 0.031, ramHrGiB: 0.004 };

// Optional coarse regional multipliers on the US base price, keyed by a prefix of
// topology.kubernetes.io/region. Default 1.0 (US). Kept small on purpose.
export const REGION_MULTIPLIER: Array<{ match: RegExp; mult: number }> = [
  { match: /^(sa-|.*-south(america)?-|.*brazil|.*saopaulo|brazilsouth)/i, mult: 1.6 },
  { match: /^(ap-|.*-(southeast|northeast|east|south)-?asia|australia|.*-au-)/i, mult: 1.3 },
  { match: /^(eu-|.*-europe-|.*-eu-|westeurope|northeurope)/i, mult: 1.1 },
];
