# Phase 10 — WAF + Bot Rules (Cloudflare)

## Scope

This runbook defines the WAF and Bot Management rules to protect API and web traffic for Pledgebook. Apply these in the Cloudflare dashboard or via the Rulesets API using the template in cloudflare-waf-ruleset.json.

## Managed Rules

- Enable Cloudflare Managed Ruleset (OWASP Core).
- Enable Bot Fight Mode (or Bot Management if available).
- Set sensitivity to “High” for /api/\*.

## Custom Rules (Baseline)

1. Block low-score bots on API:
   - Expression: (http.request.uri.path starts_with "/api/") and (cf.bot_management.score < 30) and (not cf.bot_management.verified_bot)
   - Action: block
2. JS Challenge for suspicious spikes:
   - Expression: (http.request.uri.path starts_with "/api/") and (cf.threat_score > 20)
   - Action: js_challenge
3. Allowlist admin and infrastructure ranges:
   - Expression: (ip.src in {ADMIN_IP_SET})
   - Action: skip
4. Rate limiting should remain enforced in Workers (see rate limiter middleware).

## Bot Management

- Block automated user-agents that fail Turnstile on public forms.
- Allow verified bots (search crawlers) for public pages; block on /api/\*.

## Change Control

- All rule changes must be recorded in this repo (update cloudflare-waf-ruleset.json).
- Validate in staging first, then promote to production.

## Acceptance Criteria

- API abuse attempts are blocked in WAF firewall events.
- False positives < 0.5% on staging after 24h.
