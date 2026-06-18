import React from 'react';
import { lastValueFrom } from 'rxjs';
import { AppPluginMeta, GrafanaTheme2, PluginConfigPageProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, LinkButton, Stack, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { testIds } from '../testIds';
import { APP_ID, PLUGIN_BASE_URL, ROUTES } from '../../constants';

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<{}>> {}

const updateEnabled = async (enabled: boolean) => {
  await lastValueFrom(
    getBackendSrv().fetch({
      url: `/api/plugins/${APP_ID}/settings`,
      method: 'POST',
      data: { enabled, pinned: enabled },
    })
  );
  // Reload so Grafana picks up the new nav / enabled state.
  window.location.reload();
};

const AppConfig = ({ plugin }: AppConfigProps) => {
  const s = useStyles2(getStyles);
  const enabled = Boolean(plugin.meta.enabled);

  return (
    <div data-testid={testIds.appConfig.container} className={s.wrap}>
      <h3>KubeGraf — Kubernetes monitoring</h3>
      <p className={s.desc}>
        Visualize and analyze your Kubernetes clusters: an applications map (namespaces → workloads → pods), a
        nodes overview with resource usage, and bundled Prometheus dashboards. Each cluster is a datasource
        instance pointed at a Kubernetes API server.
      </p>

      {enabled ? (
        <Stack direction="row" gap={2} alignItems="center">
          <LinkButton
            data-testid={testIds.appConfig.clusters}
            variant="primary"
            icon="apps"
            href={`${PLUGIN_BASE_URL}/${ROUTES.Clusters}`}
          >
            Open Clusters
          </LinkButton>
          <Button data-testid={testIds.appConfig.disable} variant="destructive" onClick={() => updateEnabled(false)}>
            Disable plugin
          </Button>
        </Stack>
      ) : (
        <Button data-testid={testIds.appConfig.enable} variant="primary" onClick={() => updateEnabled(true)}>
          Enable plugin
        </Button>
      )}
    </div>
  );
};

export default AppConfig;

const getStyles = (theme: GrafanaTheme2) => ({
  wrap: css({ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }),
  desc: css({ color: theme.colors.text.secondary, margin: 0 }),
});
