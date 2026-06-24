# Traffic stack profiles

RED metrics differ per ingress controller and service mesh — the metric names,
the status-code label form, the latency unit. KubeMeridian ships a **profile
registry** that maps each stack to the right queries, so the
[Services (RED)](/guide/red-slo) page works for your stack out of the box.

## Supported profiles

| Profile | Request metric | Error label | Latency | Notes |
|---|---|---|---|---|
| **Istio** | `istio_requests_total` | `response_code=~"5.."` | `istio_request_duration_milliseconds_bucket` (ms) | `reporter="destination"` |
| **Linkerd** | `response_total` | `classification="failure"` | `response_latency_ms_bucket` (ms) | `direction="inbound"` |
| **Cilium / Hubble** | `hubble_http_requests_total` | `status=~"5.."` | `hubble_http_request_duration_seconds_bucket` (s) | needs L7 visibility |
| **ingress-nginx** | `nginx_ingress_controller_requests` | `status=~"5.."` | `..._request_duration_seconds_bucket` (s) | |
| **Traefik** | `traefik_service_requests_total` | `code=~"5.."` | `traefik_service_request_duration_seconds_bucket` (s) | ns in service name |
| **HAProxy** | `haproxy_backend_http_requests_total` | `code=~"5xx"` | *(avg only)* | no histogram → avg latency |
| **Envoy** (Gateway API / Contour / Emissary) | `envoy_cluster_upstream_rq_total` | `envoy_response_code_class=~"5\|5xx"` | `envoy_cluster_upstream_rq_time_bucket` (ms) | |
| **Kong** | `kong_http_requests_total` | `code=~"5.."` | `kong_request_latency_ms_bucket` (ms) | enable status/latency metrics |
| **Consul / Kuma** | `envoy_cluster_upstream_rq_total` | `envoy_response_code_class=~"5\|5xx"` | `envoy_cluster_upstream_rq_time_bucket` (ms) | Envoy-based |
| **Prometheus HTTP** | `http_requests_total` | `code=~"5.."` | `http_request_duration_seconds_bucket` (s) | app-instrumented |
| **OpenTelemetry HTTP** | `http_server_request_duration_seconds_count` | `http_response_status_code=~"5.."` | `http_server_request_duration_seconds_bucket` (s) | semconv ≥ 1.23 |

## Auto-detect

In the cluster config, click **Detect from Prometheus** — KubeMeridian queries each
profile's signature metric and selects the one that has data. If a stack is present
but its metrics are disabled (common with Traefik, Kong, Cilium L7), the config
shows a hint.

## Custom mapping

No match? Choose **Custom…** and supply your own request metric, error label +
regex, latency bucket + unit, and service / namespace labels. The RED page builds
its queries from exactly those.
