// Helpers for parsing/formatting Kubernetes resource quantities.

// Parse a CPU quantity (e.g. "2", "500m", "250000u", "1500000000n") to millicores.
export function parseCpu(value?: string | number): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const s = String(value).trim();
  if (s.endsWith('m')) {
    return parseFloat(s);
  }
  if (s.endsWith('u')) {
    return parseFloat(s) / 1000;
  }
  if (s.endsWith('n')) {
    return parseFloat(s) / 1_000_000;
  }
  return parseFloat(s) * 1000;
}

const MEM_SUFFIXES: Record<string, number> = {
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  Pi: 1024 ** 5,
  Ei: 1024 ** 6,
  K: 1000,
  M: 1000 ** 2,
  G: 1000 ** 3,
  T: 1000 ** 4,
  P: 1000 ** 5,
  E: 1000 ** 6,
};

// Parse a memory quantity (e.g. "8138016Ki", "16Gi", "512Mi", "1000000") to bytes.
export function parseMemory(value?: string | number): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const s = String(value).trim();
  const m = s.match(/^([0-9.]+)\s*([A-Za-z]+)?$/);
  if (!m) {
    return 0;
  }
  const num = parseFloat(m[1]);
  const suffix = m[2];
  if (!suffix) {
    return num;
  }
  return num * (MEM_SUFFIXES[suffix] ?? 1);
}

export function formatCpu(millicores: number): string {
  if (millicores >= 1000) {
    return `${(millicores / 1000).toFixed(2)} cores`;
  }
  return `${Math.round(millicores)}m`;
}

export function formatMemory(bytes: number): string {
  const gib = bytes / 1024 ** 3;
  if (gib >= 1) {
    return `${gib.toFixed(1)} GiB`;
  }
  const mib = bytes / 1024 ** 2;
  return `${Math.round(mib)} MiB`;
}

export function percent(used: number, total: number): number {
  if (!total) {
    return 0;
  }
  return Math.min(100, Math.round((used / total) * 100));
}
