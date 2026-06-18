import { parseCpu, parseMemory, formatCpu, formatMemory, percent } from './resources';

describe('parseCpu (-> millicores)', () => {
  it('parses cores, millicores, micro and nano', () => {
    expect(parseCpu('2')).toBe(2000);
    expect(parseCpu('500m')).toBe(500);
    expect(parseCpu('3890m')).toBe(3890);
    expect(parseCpu('250000u')).toBe(250);
    expect(parseCpu('1500000000n')).toBe(1500);
  });
  it('handles empty/undefined', () => {
    expect(parseCpu('')).toBe(0);
    expect(parseCpu(undefined)).toBe(0);
  });
});

describe('parseMemory (-> bytes)', () => {
  it('parses binary and decimal suffixes', () => {
    expect(parseMemory('1Ki')).toBe(1024);
    expect(parseMemory('1Mi')).toBe(1024 ** 2);
    expect(parseMemory('16Gi')).toBe(16 * 1024 ** 3);
    expect(parseMemory('1M')).toBe(1_000_000);
    expect(parseMemory('1000000')).toBe(1_000_000);
  });
  it('handles empty/undefined', () => {
    expect(parseMemory('')).toBe(0);
    expect(parseMemory(undefined)).toBe(0);
  });
});

describe('formatters', () => {
  it('formatCpu', () => {
    expect(formatCpu(500)).toBe('500m');
    expect(formatCpu(2000)).toBe('2.00 cores');
  });
  it('formatMemory', () => {
    expect(formatMemory(512 * 1024 ** 2)).toBe('512 MiB');
    expect(formatMemory(2 * 1024 ** 3)).toBe('2.0 GiB');
  });
  it('percent clamps and guards zero total', () => {
    expect(percent(50, 100)).toBe(50);
    expect(percent(150, 100)).toBe(100);
    expect(percent(5, 0)).toBe(0);
  });
});
