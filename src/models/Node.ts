import { BaseModel } from './BaseModel';
import { parseCpu, parseMemory } from '../common/resources';

export interface NodeResources {
  cpu: number; // millicores
  memory: number; // bytes
  pods: number;
}

export class Node extends BaseModel {
  get ready(): boolean {
    const c = (this.data.status?.conditions || []).find((x: any) => x.type === 'Ready');
    return c?.status === 'True';
  }

  // Pressure conditions that are currently active (MemoryPressure/DiskPressure/PIDPressure = True).
  get pressures(): string[] {
    return (this.data.status?.conditions || [])
      .filter((c: any) => c.type !== 'Ready' && c.type !== 'NetworkUnavailable' && c.status === 'True')
      .map((c: any) => c.type);
  }

  get roles(): string[] {
    const labels = this.data.metadata?.labels || {};
    const roles = Object.keys(labels)
      .filter((k) => k.startsWith('node-role.kubernetes.io/'))
      .map((k) => k.split('/')[1])
      .filter(Boolean);
    if (roles.length) {
      return roles;
    }
    // Managed clusters (e.g. DOKS) have no node-role labels; fall back to the node pool / custom role.
    const pool = labels['doks.digitalocean.com/node-pool'];
    const role = labels['role'];
    return [pool || role || 'worker'].filter(Boolean);
  }

  get internalIP(): string {
    const a = (this.data.status?.addresses || []).find((x: any) => x.type === 'InternalIP');
    return a?.address || '';
  }

  get info() {
    const ni = this.data.status?.nodeInfo || {};
    return {
      kubelet: ni.kubeletVersion || '',
      os: ni.osImage || '',
      runtime: ni.containerRuntimeVersion || '',
      arch: ni.architecture || '',
    };
  }

  get allocatable(): NodeResources {
    const a = this.data.status?.allocatable || {};
    return { cpu: parseCpu(a.cpu), memory: parseMemory(a.memory), pods: parseInt(a.pods || '0', 10) };
  }

  get capacity(): NodeResources {
    const c = this.data.status?.capacity || {};
    return { cpu: parseCpu(c.cpu), memory: parseMemory(c.memory), pods: parseInt(c.pods || '0', 10) };
  }
}
