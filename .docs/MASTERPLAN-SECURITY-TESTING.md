# MASTERPLAN — Security & Testing

## Security Protocols

### Web + API

- SIWE wallet authentication.
- JWT session tokens (short TTL).
- Turnstile for spam mitigation.

### Contracts

- `nonReentrant` on all fund-moving functions.
- CRE oracle as only authorized callback.
- Slither + Mythril.

### CRE

- Deterministic prompts + outputs.
- Use hash binding to `campaignId` + `promptHash`.

---

## Testing Matrix

### Contracts

- Unit tests for each function.
- Fork tests for Aave integration.
- Invariant tests for funds conservation.

### CRE

- Mock AI output tests.
- ZKP proof generation tests.

### Workers

- API input validation tests.
- D1 migration tests.

---

## Incident Response

- Logpush to SIEM.
- Multisig admin rollback.
- Disaster recovery for D1 backups.
