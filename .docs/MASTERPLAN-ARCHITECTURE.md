# MASTERPLAN — Architecture

## Purpose

Define the system architecture, folder layout, domain boundaries, and data flow for the MVP. This is the architectural contract for all contributors.

---

## Repository Layout (Current + Target)

### Root

- apps/ — Nuxt 4 web app(s)
- blockchain/ — Hardhat contracts and scripts
- layers/ — shared Nuxt layers
- packages/ — shared TS config and ESLint config
- .docs/ — architecture and planning documents

### Target Additions

- packages/shared/ — shared types, zod schemas, and interfaces used by web + workers
- packages/cre-workflows/ — CRE workflows and utilities
- packages/zk/ — ZKP circuits and proof tooling
- apps/workers/ — Cloudflare Workers code (API, queues, crons)

---

## Domain Boundaries

### 1) Web (Nuxt 4)

**Responsibilities**: UI, wallet interactions, form validation, optimistic state, display of audit artifacts.

### 2) Smart Contracts (Hardhat)

**Responsibilities**: escrow, state transitions, funds flow, immutable prompt hashes, CRE callback authority.

### 3) CRE Workflows

**Responsibilities**: validation, baseline, evaluation, privacy proofs, consensus aggregation.

### 4) Cloudflare Workers

**Responsibilities**: API, storage orchestration, event ingestion, cache, queues.

### 5) Data Stores

- **D1**: canonical off-chain relational data
- **R2**: evidence blobs
- **IPFS**: immutable prompt/evidence hashes
- **KV**: cache/search

---

## Request Flow (Sequence)

### Campaign Creation

1. Nuxt form submits draft → Worker API.
2. Worker: validate schema → store draft in D1.
3. Worker: pin prompt to IPFS → store `promptHash`.
4. CRE ValidationWorkflow runs → returns accept/reject.
5. If accepted → factory contract creates escrow.

### Campaign Resolution

1. End date reached → CRE EvaluationWorkflow trigger.
2. CRE fetches evidence, ZKP if needed.
3. Consensus aggregated → `verifyAndRelease` callback.
4. Worker ingests on-chain events → updates D1.

---

## Folder Structure (Detailed)

### apps/web/

- app/
  - components/
  - composables/
  - pages/
  - stores/
  - types/
  - utils/
- server/ (Nuxt server routes)
- public/

### apps/workers/

- src/
  - api/
    - campaigns.ts
    - pledges.ts
    - vouchers.ts
    - disputers.ts
    - evidence.ts
    - webhooks.ts
  - queues/
    - ipfs-pin.ts
    - ocr-process.ts
    - zkp-generate.ts
  - crons/
    - campaign-end-check.ts
    - yield-report.ts
  - middleware/
    - auth.ts (SIWE)
    - rate-limit.ts
  - storage/
    - d1.ts
    - r2.ts
    - kv.ts
  - utils/
    - hashing.ts
    - validation.ts

### packages/shared/

- src/
  - types/
    - campaign.ts
    - pledge.ts
    - user.ts
    - cre.ts
  - schemas/
    - campaign.schema.ts
    - pledge.schema.ts
    - user.schema.ts

### packages/cre-workflows/

- src/
  - workflows/
    - validation.ts
    - baseline.ts
    - evaluation.ts
  - prompts/
    - validation.prompt.ts
    - baseline.prompt.ts
    - evaluation.prompt.ts
  - utils/
    - consensus.ts
    - deco.ts
    - hashing.ts

### packages/zk/

- circuits/
  - delta_increase_gte.circom
  - delta_decrease_gte.circom
  - ratio_increase_gte.circom
  - within_range.circom
- scripts/
  - build-witness.ts
  - generate-proof.ts

---

## Architectural Decisions (Why)

- **Separate Workers app** to isolate infra from Nuxt.
- **Shared schemas** to enforce consistency across layers.
- **CRE in its own package** to allow independent deployment lifecycle.
- **ZK tooling isolated** to avoid leaking heavy dependencies into app runtime.
- **Workers queues** to avoid blocking user requests.

---

## Cross-Cutting Concerns

### Security

- Least-privilege secrets per Worker module.
- Strict schema validation and input hashing.
- Turnstile on risky endpoints (campaign creation/evidence upload).

### Observability

- Structured JSON logs from Workers.
- Cloudflare Analytics + Logpush.

---

## MVP Decision Log

- MVP avoids on-chain ZKP verification unless gas is acceptable.
- Dispute resolution flow uses CRE as default, multisig as fallback.
