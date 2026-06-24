# Events

The **Events** tab is a live, filterable feed of Kubernetes events for the cluster
— read straight from the API, no metrics needed.

- **Type** filter (Warning / Normal), **namespace** filter, and free-text search
  over reason / message / object.
- Columns: last seen (age), type, reason, involved object, namespace, count,
  message. Warning rows are highlighted.
- Auto-refreshes on the cluster's configured refresh rate.

Events are the fastest way to answer "what just changed / what's failing to
schedule" — pair it with the [Workload Health](/guide/dashboards) dashboard.
