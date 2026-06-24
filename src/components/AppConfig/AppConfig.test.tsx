import React from 'react';
import { AppPluginMeta, PluginType } from '@grafana/data';
import { render, screen } from '@testing-library/react';
import AppConfig, { AppConfigProps } from './AppConfig';
import { testIds } from '../testIds';

const makeProps = (enabled: boolean): AppConfigProps =>
  ({
    plugin: {
      meta: {
        id: 'devopstech-kubemeridian-app',
        name: 'KubeMeridian',
        type: PluginType.app,
        enabled,
        jsonData: {},
      } as unknown as AppPluginMeta,
    },
    query: {},
  }) as unknown as AppConfigProps;

describe('Components/AppConfig', () => {
  test('shows Enable when the app is disabled', () => {
    render(<AppConfig {...makeProps(false)} />);
    expect(screen.getByTestId(testIds.appConfig.enable)).toBeInTheDocument();
  });

  test('shows Open Clusters + Disable when the app is enabled', () => {
    render(<AppConfig {...makeProps(true)} />);
    expect(screen.getByTestId(testIds.appConfig.clusters)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.appConfig.disable)).toBeInTheDocument();
  });
});
