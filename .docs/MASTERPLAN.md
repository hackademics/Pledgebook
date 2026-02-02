# Pledgebook MASTERPLAN (MVP)

## Purpose

Deliver a complete, secure MVP that integrates: Nuxt 4 app, Hardhat smart contracts, Chainlink CRE + DECO consensus workflows, ZKP privacy, and Cloudflare hosting/services. This master plan consolidates the core framework concepts into executable development tasks, standards, and best practices.

---

## Guiding Principles (John Carmack)

- **Simplicity over cleverness**: prefer the smallest correct solution.
- **Data-oriented design**: explicit state; avoid hidden side effects.
- **Determinism**: reproducible builds, testable workflows, fixed inputs/outputs.
- **Incremental validation**: simulate end-to-end early, then iterate.
- **Minimal APIs**: do one thing well; avoid leaky abstractions.
- **Performance discipline**: measure first, optimize only where proven.
- **Defensive coding**: assert invariants; fail fast and loudly.

---

## MVP Outcomes (Acceptance Criteria)

- End-to-end lifecycle: **Create → Validate → Baseline → Pledge/Vouch/Dispute → Evaluate → Release/Refund**.
- CRE workflows run end-date evaluation and call contract callbacks.
- Private evidence supports DECO + ZKP flows.
- Funds escrowed in USDC, yield via Aave V3, automated distribution.
- Cloudflare-first hosting: Pages/Workers + D1 + R2 + KV + Queues + Analytics.
- Security: auditable prompt hashes, strict access control, least-privilege secrets.

---

## Architecture Overview

### Core Components

1. **Nuxt 4 Web App** (apps/web): UI/UX, wallet connections, campaign creation, dashboard.
2. **Smart Contracts** (blockchain/contracts): Polygon escrow, factory, CRE callback endpoints.
3. **CRE Workflows** (Chainlink): validation/baseline/evaluation workflows.
4. **Backend (Cloudflare Workers)**: API, auth, evidence pipeline, D1 access, event ingestion.
5. **Storage**: D1 (relational), R2 (uploads), IPFS (prompt/evidence hash pinning), KV (cache).
6. **Observability**: Logs, analytics, security monitoring.

---

## Cloudflare Integration Plan (Use Every Relevant Service)

- **Pages**: Host Nuxt 4 app (SSR/edge rendering).
- **Workers**: API routes, webhook ingestion, SIWE auth, CRE callback relay.
- **D1**: Core relational data (campaigns, pledges, vouchers, disputers).
- **R2**: Evidence uploads (images, documents), encrypted at rest.
- **KV**: Low-latency cache for campaign list/search.
- **Queues**: Async processing (image OCR pipeline, IPFS pinning, ZKP jobs).
- **Durable Objects**: Optional session/workflow state (campaign lifecycle locks).
- **Cron Triggers**: Time-based jobs (campaign end checks, yield reports).
- **Images**: Evidence media optimization for UI previews.
- **Analytics**: Usage tracking, performance monitoring.
- **Logpush**: Audit logs to external SIEM.
- **WAF + Bot Management**: Protect endpoints.
- **Turnstile**: Anti-bot for campaign creation.
- **Access/Zero Trust**: Admin dashboard protection.
- **Secrets**: API keys, DECO keys, CRE keys, pinning service keys.
- **Email Routing** (optional): Notification pipeline.
- **Workers AI Gateway** (optional): route AI calls if required; keep CRE as source of truth.

---

## Phase Plan (MVP)

### Phase 0 — Foundations (Week 0–1)

**Goal**: Establish repo, environment, and conventions.

- Define environment variables + secrets strategy.
- Confirm Polygon network, USDC address, Aave V3 pool, Chainlink CRE endpoints.
- Establish CI pipeline for lint/test/build.
- Add contract deploy scripts and env profiles (local, testnet, mainnet).

**Deliverables**:

- Environment spec and CI checklist.
- Base config for Nuxt 4 + Workers + D1.

---

### Phase 1 — Data Models & Backend API (Week 1–2)

**Goal**: Implement D1 schemas and API endpoints.

**Tasks**:

- Create D1 schema per campaign/user/pledge/voucher/disputer models.
- Implement Workers API for:
  - campaign create/update
  - campaign list/search
  - pledge/vouch/dispute records
  - evidence upload metadata
- Add immutable prompt hash creation and IPFS pinning workflow.
- Add event ingestion endpoints for on-chain event sync.

**Cloudflare**:

- D1 migrations + versioned scripts.
- KV for cache + search results.
- Queues for IPFS pinning and evidence processing.

---

### Phase 2 — Smart Contracts (Week 2–4)

**Goal**: Implement and test escrow + factory with CRE integration.

**Tasks**:

- Build `CampaignFactory.sol` and `PledgeEscrow.sol` (USDC, Aave V3).
- Enforce state machine and access control.
- Implement `verifyAndRelease` callback restricted to CRE oracle.
- Add events for every action (pledge/vouch/dispute/verify/refund).
- Implement yield accounting and distribution logic.
- Add dispute window and thresholds.

**Hardhat**:

- Unit tests: create/pledge/vouch/dispute/resolve.
- Fork tests for Aave + USDC.
- Gas tests for large pledge lists (batching strategies).

---

### Phase 3 — CRE Workflows (Week 3–5)

**Goal**: Build validation, baseline, and evaluation workflows.

**Tasks**:

- Implement workflows:
  1. **ValidationWorkflow**: SMART checks + refine prompt.
  2. **BaselineWorkflow**: baseline extraction + ZKP (if private).
  3. **EvaluationWorkflow**: end-date consensus, 2/3 threshold.
- Integrate DECO for private API fetches.
- Implement prompt templates + hashing strategy.
- Build consensus aggregation with BFT threshold.
- Implement CRE callback to contracts.

**Testing**:

- CRE local simulation with mock AI responses.
- E2E test: Baseline → Evaluation → Callback.

---

### Phase 4 — Evidence & Privacy Pipeline (Week 4–6)

**Goal**: Support proofs, ZKPs, and evidence storage.

**Tasks**:

- Evidence upload pipeline (Nuxt → R2 → IPFS pin → D1 record).
- OCR + AI vision pipeline (Cloudflare Queues + worker processors).
- ZKP circuits: `delta_increase_gte`, `delta_decrease_gte`, `ratio_increase_gte`, `within_range`.
- Bind ZKP proofs to `campaignIdHash` + `promptHash`.
- On-chain proof verification (if required in MVP) or off-chain attestation with hashes.

---

### Phase 5 — Nuxt 4 UI/UX (Week 4–7)

**Goal**: Complete front-end workflows.

**Tasks**:

- Campaign creation flow: goal, sources, privacy mode, end date, prompt.
- Wallet integration for pledge/vouch/dispute.
- Campaign page with status, prompt hash, evidence, consensus results.
- User dashboards for pledger, creator, voucher, disputer.
- Admin dashboard (Access protected) for manual review.

---

### Phase 6 — Observability, Security & Launch (Week 7–8)

**Goal**: Harden and deploy.

**Tasks**:

- Threat modeling + security review.
- Slither/Mythril for contracts.
- Pen-test Worker APIs.
- Enable WAF, Bot Management, Turnstile.
- Configure Logpush + Analytics.
- Deploy to Cloudflare Pages + Workers.
- Final testnet release, then mainnet.

---

## Development Standards & Conventions

### General

- **Immutable prompts**: prompt text in IPFS + hash on-chain + D1.
- **Strict schema**: all records validated with Zod.
- **State machine**: single source of truth for campaign status.
- **Hash everything**: inputs, outputs, evidence, prompts.

### Smart Contracts

- Use OpenZeppelin for access control and SafeERC20.
- Guard all transfers with `nonReentrant` and status checks.
- No floating point; use basis points and integer math.
- Avoid unbounded loops; use batching when needed.
- Emit events for every state mutation.

### CRE Workflows

- Modular steps: fetch → verify → aggregate → callback.
- Deterministic outputs with strict JSON schema.
- Parallel AI calls; BFT threshold for consensus.
- Use DECO for private data; never store raw private values.

### Nuxt + Workers

- API contracts documented with OpenAPI.
- Use typed fetchers and schema validation.
- Minimize server round-trips with caching.

---

## Security & Trust Model

- **On-chain**: Escrow, funds, and prompt hashes are immutable.
- **Off-chain**: D1 mirrors on-chain state and stores metadata only.
- **CRE**: Trusted automation with deterministic workflows and cryptographic outputs.
- **Privacy**: DECO + ZKPs; only proof hashes exposed.
- **Admin override**: Multisig-only for edge disputes.

---

## Testing Matrix

### Smart Contracts

- Unit: All state transitions, edge cases, reverts.
- Integration: Aave + USDC fork tests.
- Security: Slither, Mythril, custom invariant tests.

### CRE Workflows

- Simulation: Mock AI responses for validation/baseline/evaluation.
- Integration: Callbacks to testnet contracts.
- Privacy: ZKP proof generation and verification.

### Nuxt/Workers

- Unit: Composables and stores.
- Integration: Wallet flows + API validation.
- E2E: Full lifecycle test with testnet.

---

## Research Topics (Unknowns / Verify)

- Exact CRE SDK version and production deployment flow.
- Current DECO availability and ZKP tooling for production.
- AI provider availability and rate limits in CRE.
- Aave V3 contract addresses and USDC token for target network.
- Gas costs for on-chain ZKP verification (MVP decision).
- Cloudflare Pages SSR + Workers integrations for Nuxt 4 in production.
- IPFS pinning provider and pricing (Pinata, web3.storage, etc.).

---

## Suggested Document Split (Optional)

If you want this masterplan separated into multiple documents:

1. **MASTERPLAN-ARCHITECTURE.md**
2. **MASTERPLAN-CONTRACTS.md**
3. **MASTERPLAN-CRE.md**
4. **MASTERPLAN-CLOUDFLARE.md**
5. **MASTERPLAN-SECURITY-TESTING.md**

---

## Next Action Recommendation

1. Confirm research topics and finalize dependency decisions.
2. Implement Phase 1 D1 schema + Worker API endpoints.
3. Start Hardhat contract scaffolding and unit tests.
