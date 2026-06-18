import React from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, LinkButton, Select, Stack, Tab, TabsBar } from '@grafana/ui';

export type ActiveTab = 'status' | 'apps' | 'nodes';

interface Props {
  active: ActiveTab;
  clusters: Array<SelectableValue<string>>;
  currentClusterId: string;
  links: { status: string; apps: string; nodes: string; edit: string; config: string };
  isAdmin: boolean;
  onClusterChange: (value: string) => void;
}

export function PageHeader({ active, clusters, currentClusterId, links, isAdmin, onClusterChange }: Props) {
  return (
    <Stack direction="column" gap={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" wrap="wrap">
        <TabsBar>
          <Tab href={links.status} label="Cluster status" active={active === 'status'} />
          <Tab href={links.apps} label="Applications Overview" active={active === 'apps'} />
          <Tab href={links.nodes} label="Nodes Overview" active={active === 'nodes'} />
        </TabsBar>

        <Stack direction="row" gap={1} alignItems="center">
          <InlineField label="Cluster">
            <Select
              width={24}
              options={clusters}
              value={clusters.find((o) => String(o.value) === String(currentClusterId)) ?? null}
              onChange={(v) => onClusterChange(String(v.value))}
            />
          </InlineField>
          {isAdmin && (
            <LinkButton variant="secondary" icon="cog" href={links.edit}>
              Edit
            </LinkButton>
          )}
          <LinkButton variant="secondary" icon="apps" href={links.config}>
            Plugin config
          </LinkButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
