# devopstech.net

Sources of [devopstech.net](https://devopstech.net), the home of **ICE** — Kubernetes security
fixes delivered as GitOps pull requests and closed only when a measurement after the merge
proves them — and of **deusex**, the autonomous development loop that builds it.

| Path | What it is |
| --- | --- |
| [`docs/`](docs/) | The VitePress site; how to run and deploy it is in [`docs/README.md`](docs/README.md) |
| [`functions/`](functions/) | Cloudflare Pages Functions: the Go vanity import for `devopstech.net/ice` |
| [`workers/pilot/`](workers/pilot/) | The worker behind the design-partner form (`devopstech.net/api/pilot`) |

`npm ci && npm run lint` lints the JavaScript; CI also builds the site and bundles the worker
on every pull request.

## KubeMeridian (archived)

This repository used to hold **KubeMeridian**, a Kubernetes observability app plugin for
Grafana. It was archived in October 2026: Grafana Labs declined to list it in the plugin
catalog because it overlaps with Grafana Cloud Kubernetes Monitoring, so it can't get a
community signature. The plugin source and its user guide are kept at the
[`v2.5.2` tag](https://github.com/blackcheshire13/kubemeridian/tree/v2.5.2), and the last
release, [v2.5.2](https://github.com/blackcheshire13/kubemeridian/releases/tag/v2.5.2), still
installs as an unsigned plugin — see [devopstech.net/kubemeridian](https://devopstech.net/kubemeridian#install).
`deploy/` and two screenshots under `src/` stay on this branch because that release's README
links to them.

## License

Apache-2.0 — see [LICENSE](LICENSE).
