# MASTERPLAN — Standards, Patterns, Conventions, Best Practices

## Guiding Principles (Carmack)

- Keep it simple and deterministic.
- State changes must be explicit and logged.
- Avoid hidden state or magic.
- Always write tests for edge cases.

---

## General Standards

### Naming

- Files: `kebab-case` or `camelCase` per project conventions.
- Functions: verbs (`createCampaign`, `verifyAndRelease`).
- Types: PascalCase (`Campaign`, `VerificationInput`).

### Versioning

- Semantic versioning for packages.
- D1 migrations are immutable and versioned.

### Documentation

- Every new module must include a README.
- All APIs must be documented via OpenAPI.

---

## Smart Contract Standards

- Use OpenZeppelin security libraries.
- Enforce access control on every public method.
- Use `nonReentrant` on any function moving funds.
- Emit events for every state change.
- No unbounded loops without batching.
- Always check prompt hash in CRE callback.

---

## CRE Standards

- Every workflow must be deterministic and stateless.
- Prompts are immutable (hash + IPFS).
- Always validate AI output schema.
- Aggregate results with BFT threshold >= 2/3.

---

## Cloudflare Standards

- Use Workers for API logic; keep Pages SSR minimal.
- Use Queues for heavy/async work.
- Use KV only for cached data.
- Apply Turnstile on user-generated inputs.

---

## Testing Standards

- Unit tests for every new function.
- Integration tests for end-to-end lifecycle.
- Security testing for contracts (Slither/Mythril).
- Load test API endpoints quarterly.

---

## Security Best Practices

- Least privilege for all secrets.
- Rotate keys quarterly.
- Avoid exposing raw private data.
- Prefer ZKP proofs where possible.
