import { Node } from './Node';

const baseNode = (overrides: any = {}) => ({
  metadata: { name: 'node-1', labels: {}, ...overrides.metadata },
  status: {
    conditions: [{ type: 'Ready', status: 'True' }],
    addresses: [
      { type: 'Hostname', address: 'node-1' },
      { type: 'InternalIP', address: '10.0.0.5' },
    ],
    allocatable: { cpu: '4', memory: '8Gi', pods: '110' },
    capacity: { cpu: '4', memory: '8Gi', pods: '110' },
    nodeInfo: { kubeletVersion: 'v1.30.1', osImage: 'Ubuntu', containerRuntimeVersion: 'containerd', architecture: 'amd64' },
    ...overrides.status,
  },
});

describe('Node model', () => {
  it('reports ready when the Ready condition is True', () => {
    expect(new Node(baseNode()).ready).toBe(true);
  });

  it('reports not ready when Ready is not True', () => {
    const n = new Node(baseNode({ status: { conditions: [{ type: 'Ready', status: 'False' }] } }));
    expect(n.ready).toBe(false);
  });

  it('lists active pressures and ignores Ready/NetworkUnavailable', () => {
    const n = new Node(
      baseNode({
        status: {
          conditions: [
            { type: 'Ready', status: 'True' },
            { type: 'MemoryPressure', status: 'True' },
            { type: 'DiskPressure', status: 'False' },
            { type: 'NetworkUnavailable', status: 'True' },
          ],
        },
      })
    );
    expect(n.pressures).toEqual(['MemoryPressure']);
  });

  it('derives roles from node-role labels', () => {
    const n = new Node(baseNode({ metadata: { name: 'cp', labels: { 'node-role.kubernetes.io/control-plane': '' } } }));
    expect(n.roles).toContain('control-plane');
  });

  it('falls back to the DOKS node pool when no role label exists', () => {
    const n = new Node(baseNode({ metadata: { name: 'w', labels: { 'doks.digitalocean.com/node-pool': 'pool-a' } } }));
    expect(n.roles).toEqual(['pool-a']);
  });

  it('defaults to worker when nothing identifies the role', () => {
    expect(new Node(baseNode()).roles).toEqual(['worker']);
  });

  it('reads the internal IP address', () => {
    expect(new Node(baseNode()).internalIP).toBe('10.0.0.5');
  });

  it('parses allocatable cpu/memory/pods', () => {
    const a = new Node(baseNode()).allocatable;
    expect(a.cpu).toBe(4000); // millicores
    expect(a.memory).toBe(8 * 1024 * 1024 * 1024);
    expect(a.pods).toBe(110);
  });

  it('is resilient to a node with no status', () => {
    const n = new Node({ metadata: { name: 'bare' } });
    expect(n.ready).toBe(false);
    expect(n.pressures).toEqual([]);
    expect(n.internalIP).toBe('');
    expect(n.roles).toEqual(['worker']);
  });
});
