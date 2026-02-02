# Phase 10 — Analytics Dashboards

## Scope

Define analytics dashboards sourced from Cloudflare Analytics and Logpush datasets. Dashboards should be implemented in the chosen BI tool (Grafana/Looker/Datadog).

## Dashboard 1: API Health

- Requests per minute (RPM)
- p95 latency
- Error rate (4xx/5xx)
- Top endpoints by volume

## Dashboard 2: WAF + Bot

- Blocked requests by rule
- Bot score distribution for /api/\*
- Challenge solves and failures

## Dashboard 3: Campaign Funnel

- Campaign create attempts vs success
- Pledge attempts vs success
- Dispute/verification outcomes

## Dashboard 4: Infrastructure

- Worker CPU time
- Queue processing latency
- D1 query latency and errors

## Data Sources

- Cloudflare Analytics (Pages/Workers)
- Logpush datasets (http_requests, firewall_events, workers_trace_events, workers_invocations)

## Acceptance Criteria

- Dashboards live in staging with 24h of data.
- 3 key alerts configured (latency, error rate, WAF spike).
