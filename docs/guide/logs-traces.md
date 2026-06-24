# Logs & traces

The Logs and Traces pages are built with **Grafana Scenes**, so they're live,
interactive panels embedded right in the app.

## Logs (Loki)

Link a **Loki** datasource to the cluster ([Connections](/guide/connections)) and
the **Logs** tab lights up:

- Namespace / pod / container selectors + a free-text filter.
- A logs panel and an error/warn log-rate timeseries.
- **Inline pod logs:** click any pod in Applications Overview to open its logs in a
  drawer — scoped to `{namespace, pod}` — without leaving the topology.

The free-text filter is sent as a backtick-delimited LogQL line filter, so quotes
and special characters in your search don't break the query.

## Traces (Tempo)

Link a **Tempo** datasource and the **Traces** tab gives you:

- A **TraceQL search** list (editable query, default `{}` for recent traces).
- A **service graph** (Tempo service map).

## Correlation

Because logs, metrics and traces are all queried through the cluster's linked
datasources, you can configure Grafana datasource correlations (Prometheus
exemplars → Tempo, Tempo → Loki) to jump between pillars. KubeMeridian surfaces
each pillar; the correlation links are standard Grafana datasource config.
