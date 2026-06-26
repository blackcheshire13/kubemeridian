import React from 'react';
import { SelectableValue } from '@grafana/data';
import {
  SceneComponentProps,
  SceneObjectBase,
  SceneObjectState,
  SceneQueryRunner,
} from '@grafana/scenes';
import { RadioButtonGroup } from '@grafana/ui';

export interface LogLevelFilterState extends SceneObjectState {
  /** Currently selected LogQL line-filter fragment ('' = all levels). */
  value: string;
  /** Logs query without any level filter (keeps `$namespace`/`$pod`/`$search` tokens). */
  baseExpr: string;
  /** Max lines to keep on the logs panel query. */
  maxLines: number;
  /** Segments to render — `value` is the LogQL fragment appended to `baseExpr`. */
  options: Array<SelectableValue<string>>;
  /** Logs-panel query runner this control re-runs when the level changes. */
  queryRunner: SceneQueryRunner;
}

/**
 * A segmented control (All / Errors / Errors + warnings) for the Logs page.
 * On change it appends the chosen LogQL line-filter to the logs-panel query and
 * re-runs it — only the log viewer is affected, the stat/volume/pie panels keep
 * showing every level so the distribution stays visible.
 */
export class LogLevelFilter extends SceneObjectBase<LogLevelFilterState> {
  static Component = LogLevelFilterRenderer;

  public onChange = (value: string) => {
    this.setState({ value });
    this.state.queryRunner.setState({
      queries: [{ refId: 'A', expr: this.state.baseExpr + value, maxLines: this.state.maxLines } as any],
    });
    this.state.queryRunner.runQueries();
  };
}

function LogLevelFilterRenderer({ model }: SceneComponentProps<LogLevelFilter>) {
  const { value, options } = model.useState();
  return (
    <RadioButtonGroup
      aria-label="Log level filter"
      size="sm"
      options={options}
      value={value}
      onChange={model.onChange}
    />
  );
}
