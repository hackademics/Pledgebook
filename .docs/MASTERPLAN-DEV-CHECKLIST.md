# MASTERPLAN — Development Checklist (Sequential)

## How to Use

- Check items only after code merged + tests pass.
- Each section depends on prior sections.
- Add assignee and target date per item.

---

## Phase 0 — Foundations

- [x] Confirm target network (Polygon mainnet + testnet) — Assignee: Copilot — Target: 2026-01-30
- [x] Confirm USDC + Aave V3 addresses — Assignee: Copilot — Target: 2026-01-30
- [x] Confirm CRE SDK version + availability — Assignee: Copilot — Target: 2026-01-30
- [x] Define secrets strategy (Cloudflare + CRE) — Assignee: Copilot — Target: 2026-01-30
- [x] Establish CI pipeline (lint, test, build) — Assignee: Copilot — Target: 2026-01-30
- [x] Add environment config templates (local/testnet/mainnet) — Assignee: Copilot — Target: 2026-01-30

---

## Phase 1 — Shared Types & Schemas

- [x] Create packages/shared structure — Assignee: Copilot — Target: 2026-01-30
- [x] Define Zod schemas: User, Campaign, Pledge, Voucher, Disputer — Assignee: Copilot — Target: 2026-01-30
- [x] Define CRE input/output schemas — Assignee: Copilot — Target: 2026-01-30
- [x] Add type exports and barrel files — Assignee: Copilot — Target: 2026-01-30
- [x] Add schema validation utilities — Assignee: Copilot — Target: 2026-01-30

---

## Phase 2 — D1 Schema + Migrations

- [x] Write D1 migrations for users/campaigns/pledges/vouchers/disputers — Assignee: Copilot — Target: 2026-01-30
- [x] Add indexes for campaigns (status, creator, slug) — Assignee: Copilot — Target: 2026-01-30
- [x] Add JSONB fields for prompts and consensus results — Assignee: Copilot — Target: 2026-01-30
- [x] Add migration runner scripts — Assignee: Copilot — Target: 2026-01-30

---

## Phase 3 — Cloudflare Workers (API)

- [x] Create Workers app structure — Assignee: Copilot — Target: 2026-01-30
- [x] Implement SIWE auth middleware — Assignee: Copilot — Target: 2026-01-30
- [x] Implement rate limiting + Turnstile validation — Assignee: Copilot — Target: 2026-01-30
- [x] Implement API endpoints: — Assignee: Copilot — Target: 2026-01-30
  - [x] POST /campaigns — Assignee: Copilot — Target: 2026-01-30
  - [x] PATCH /campaigns/:id — Assignee: Copilot — Target: 2026-01-30
  - [x] GET /campaigns — Assignee: Copilot — Target: 2026-01-30
  - [x] POST /pledges — Assignee: Copilot — Target: 2026-01-30
  - [x] POST /vouches — Assignee: Copilot — Target: 2026-01-30
  - [x] POST /disputes — Assignee: Copilot — Target: 2026-01-30
  - [x] POST /evidence — Assignee: Copilot — Target: 2026-01-30
- [x] Add OpenAPI docs and validation — Assignee: Copilot — Target: 2026-01-30
- [x] Add event ingestion endpoint for on-chain events — Assignee: Copilot — Target: 2026-01-30

---

## Phase 4 — Storage Pipeline

- [x] Configure R2 bucket — Assignee: Copilot — Target: 2026-01-30
- [x] Implement evidence upload (R2 + metadata in D1) — Assignee: Copilot — Target: 2026-01-30
- [x] Implement IPFS pinning worker — Assignee: Copilot — Target: 2026-01-30
- [x] Create KV cache for campaign listings — Assignee: Copilot — Target: 2026-01-30
- [x] Implement queue consumers for OCR + pinning — Assignee: Copilot — Target: 2026-01-30

---

## Phase 5 — Smart Contracts (Hardhat)

- [x] Implement `CampaignFactory.sol` — Assignee: Copilot — Target: 2026-01-30
- [x] Implement `PledgeEscrow.sol` — Assignee: Copilot — Target: 2026-01-30
- [x] Add access control + CRE oracle guard — Assignee: Copilot — Target: 2026-01-30
- [x] Add events for all state changes — Assignee: Copilot — Target: 2026-01-30
- [x] Implement Aave deposit/withdraw — Assignee: Copilot — Target: 2026-01-30
- [x] Implement `verifyAndRelease` logic — Assignee: Copilot — Target: 2026-01-30
- [x] Add dispute window + threshold logic — Assignee: Copilot — Target: 2026-01-30

---

## Phase 6 — Contract Tests

- [x] Unit tests for create/pledge/vouch/dispute — Assignee: Copilot — Target: 2026-01-30
- [x] Unit tests for verifyAndRelease success/failure — Assignee: Copilot — Target: 2026-01-30
- [x] Fork tests with Aave + USDC — Assignee: Copilot — Target: 2026-01-30
- [x] Gas profiling for 50–100 pledgers — Assignee: Copilot — Target: 2026-01-30

---

## Phase 7 — CRE Workflows

- [x] Create `ValidationWorkflow` — Assignee: Copilot — Target: 2026-01-30
- [x] Create `BaselineWorkflow` — Assignee: Copilot — Target: 2026-01-30
- [x] Create `EvaluationWorkflow` — Assignee: Copilot — Target: 2026-01-30
- [x] Implement prompt templates + hash storage — Assignee: Copilot — Target: 2026-01-30
- [x] Add DECO integration for private sources — Assignee: Copilot — Target: 2026-01-30
- [x] Add consensus aggregation (2/3) — Assignee: Copilot — Target: 2026-01-30
- [x] Add CRE callback binding — Assignee: Copilot — Target: 2026-01-30

---

## Phase 8 — CRE Tests

- [x] Mock AI responses with schema validation — Assignee: Copilot — Target: 2026-01-30
- [x] Simulate validation → baseline → evaluation — Assignee: Copilot — Target: 2026-01-30
- [x] Test ZKP hash generation path — Assignee: Copilot — Target: 2026-01-30
- [x] Add CRE callback status endpoint — Assignee: Copilot — Target: 2026-01-30
- [ ] Confirm callback success on testnet — Assignee: TBD — Target: TBD

---

## Phase 9 — Nuxt 4 UI

- [x] Campaign creation wizard — Assignee: Copilot — Target: 2026-01-30
- [x] Evidence upload UI — Assignee: Copilot — Target: 2026-01-30
- [x] Wallet integration (pledge/vouch/dispute) — Assignee: Copilot — Target: 2026-01-30
- [x] Campaign detail page (hashes + results) — Assignee: Copilot — Target: 2026-01-30
- [x] Dashboard views per role — Assignee: Copilot — Target: 2026-01-30
- [x] Admin review page (Access protected) — Assignee: Copilot — Target: 2026-01-30

---

## Phase 10 — Observability + Security

- [x] WAF + Bot rules — Assignee: Copilot — Target: 2026-01-30
- [x] Logpush configuration — Assignee: Copilot — Target: 2026-01-30
- [x] Analytics dashboards — Assignee: Copilot — Target: 2026-01-30
- [x] Contract audit tools (Slither/Mythril) — Assignee: Copilot — Target: 2026-01-30
- [x] Pen-test API endpoints — Assignee: Copilot — Target: 2026-01-30

---

## Phase 11 — Deployment (Testnet)

- [ ] Deploy contracts to testnet — Assignee: TBD — Target: TBD
- [ ] Deploy CRE workflows to testnet — Assignee: TBD — Target: TBD
- [ ] Deploy Workers + Pages to staging — Assignee: TBD — Target: TBD
- [ ] Run full E2E test with testnet wallet — Assignee: TBD — Target: TBD

---

## Phase 12 — Production Launch

- [ ] Deploy contracts to mainnet — Assignee: TBD — Target: TBD
- [ ] Deploy CRE workflows to production — Assignee: TBD — Target: TBD
- [ ] Deploy Workers + Pages to production — Assignee: TBD — Target: TBD
- [ ] Run post-deploy smoke tests — Assignee: TBD — Target: TBD
- [ ] Enable monitoring + alerts — Assignee: TBD — Target: TBD
