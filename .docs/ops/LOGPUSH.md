# Phase 10 — Logpush Configuration

## Scope

Configure Cloudflare Logpush to deliver logs to an R2 bucket or SIEM. Use the template in cloudflare-logpush-dataset.json to define fields and filters.

## Datasets

- http_requests: HTTP requests for Pages/Workers
- firewall_events: WAF and Bot events
- workers_trace_events: trace logs
- workers_invocations: invocation-level metrics

## Destination

- R2: s3-compatible endpoint
- SIEM: HTTPS endpoint with token auth

## Steps (Dashboard)

1. Create R2 bucket: pledgebook-logpush
2. Add Logpush job for each dataset
3. Apply filters:
   - Include only zone: pledgebook
   - Include only /api/_ and /\_nuxt/_ as needed
4. Verify delivery with a 5-minute test

## Retention

- R2 retention: 30–90 days hot, 365 days cold.

## Acceptance Criteria

- Logs received for 3 consecutive hours in staging.
- No missing fields in required dataset schema.
