# MASTERPLAN — Cloudflare Infrastructure

## Services Used

- Pages, Workers, D1, R2, KV, Queues, Cron Triggers
- WAF, Bot Management, Turnstile, Analytics
- Logpush, Access, Zero Trust

---

## Workers App Structure

- api/
- queues/
- crons/
- middleware/
- storage/

---

## Security Protocols

- Turnstile on campaign creation and evidence upload.
- WAF rules for API abuse.
- Rate limiting in Workers.
- Access protection for admin routes.

---

## Storage

- D1 = relational records.
- R2 = evidence blobs.
- IPFS = immutable hashes.
- KV = caching.

---

## Queues

- IPFS pinning jobs.
- OCR/AI vision pipeline.
- ZKP proof generation.

---

## Tests

- Integration tests for API endpoints.
- D1 migration tests.
- Queue worker tests.
