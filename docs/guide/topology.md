# Topology & nodes

KubeMeridian reads the Kubernetes API directly (read-only) to render live inventory
— no metrics required.

## Cluster Status

The control-plane components plus a grid of nodes. Each node shows Ready / role /
pressure badges, CPU & memory requests vs allocatable, pod count, and a grid of
pod squares coloured by status (running / pending / failed) with a tooltip.

## Applications Overview

A hierarchical map: **namespace → workload → pod**, covering deployments,
statefulsets, daemonsets, jobs, cronjobs and bare pods, with the services that
select them. Expand/collapse state is remembered.

- **Click a pod → its Loki logs** open in a drawer (when a Loki datasource is
  linked — see [Logs & traces](/guide/logs-traces)).
- Each pod links to the bundled Pod dashboard.

## Nodes Overview

Per-node resource bars (CPU/memory requests vs allocatable, summed from the pods
on the node), pod counts, roles, kubelet/OS/runtime info, and a deep link to the
Node dashboard.

## Events

A live, filterable feed of Kubernetes events — see [Events](/guide/events).
