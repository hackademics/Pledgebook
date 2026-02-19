# Pledgebook Demo - Work Tracker

## 🎯 Demo Objective

Demonstrate AI-verified outcome-based fundraising using Chainlink CRE.

### Demo Scenario

1. Show paper with "chainlink" written **1 time** (baseline)
2. Create pledge campaign, upload baseline photo
3. Pledge to write "chainlink" **20 times**
4. Complete the pledge, take new photo showing 20 instances
5. Upload completion evidence
6. CRE workflow verifies completion via AI consensus
7. Funds released to creator, vouchers refunded, disputers slashed

---

## 📊 Progress Summary

### ✅ Phase 1: Database & Basic Endpoints — COMPLETE

| Task                   | Status  | Location                                        |
| ---------------------- | ------- | ----------------------------------------------- |
| Migration 0017         | ✅ Done | `migrations/0017_evidence_verification.sql`     |
| Baseline endpoint      | ✅ Done | `api/campaigns/[campaignId]/baseline.post.ts`   |
| Completion endpoint    | ✅ Done | `api/campaigns/[campaignId]/completion.post.ts` |
| Evidence type tracking | ✅ Done | DB columns + Zod validation                     |

### ✅ Phase 2: Vision AI Integration — COMPLETE

| Task                      | Status  | Location                            |
| ------------------------- | ------- | ----------------------------------- |
| Vision verify proxy       | ✅ Done | `api/ai/vision-verify.post.ts`      |
| Verification trigger      | ✅ Done | `api/cre/verify-completion.post.ts` |
| CRE workflow update       | ✅ Done | `cre/pledgebook-workflow/main.ts`   |
| OpenAI GPT-4o integration | ✅ Done | Direct API call                     |

### ✅ Phase 3: Contract Oracle Integration — COMPLETE

| Task                    | Status  | Location                            |
| ----------------------- | ------- | ----------------------------------- |
| Oracle utility          | ✅ Done | `server/utils/oracle.ts`            |
| verifyAndRelease ABI    | ✅ Done | `app/config/contracts.ts`           |
| Auto-callback on verify | ✅ Done | `api/cre/verify-completion.post.ts` |
| Campaign status update  | ✅ Done | DB update after oracle call         |

### ✅ Phase 4: Frontend UI — COMPLETE

| Task                       | Status  | Location                                           |
| -------------------------- | ------- | -------------------------------------------------- |
| VerificationCard component | ✅ Done | `components/evidence/VerificationCard.vue`         |
| VerificationStatusBadge    | ✅ Done | `components/evidence/VerificationStatusBadge.vue`  |
| Evidence GET endpoint      | ✅ Done | `api/evidence/[id].get.ts`                         |
| Campaign schema update     | ✅ Done | Added `baselineEvidenceId`, `completionEvidenceId` |
| 3-step progress UI         | ✅ Done | Baseline → Completion → Verify                     |
| AI result display          | ✅ Done | Counts, confidence, reasoning                      |
| Transaction link           | ✅ Done | Links to Polygonscan                               |

### ✅ Phase 5: Contracts & Testing — COMPLETE

| Task                     | Status  | Location                                |
| ------------------------ | ------- | --------------------------------------- |
| Token flow documentation | ✅ Done | `docs/TOKEN-FLOWS.md`                   |
| Integration test suite   | ✅ Done | `test/pledgeEscrow.integration.test.ts` |
| Local deployment script  | ✅ Done | `scripts/deployLocal.ts`                |
| All tests passing        | ✅ Done | 34 passing, 2 skipped (fork tests)      |

---

## 🧪 Test Results

```
✅ CampaignFactory (1 test)
✅ PledgeEscrow Edge Cases (10 tests)
✅ PledgeEscrow Invariant Tests (2 tests)
✅ PledgeEscrow Fuzz-like Tests (2 tests)
✅ PledgeEscrow Integration (11 tests)
✅ PledgeEscrow (8 tests)
─────────────────────────────
   34 passing, 2 pending
```

---

## 🔧 Local Development Setup

### Start Local Blockchain

```bash
cd blockchain/contracts

# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy all contracts + create demo campaign
npm run deploy:local
```

### Environment Variables (from deployLocal output)

```env
USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
AAVE_POOL_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
FACTORY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
CRE_ORACLE_ADDRESS=0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
TREASURY_ADDRESS=0x976EA74026E726554dB657fA54763abd0C3a0aa9
DEMO_CAMPAIGN_ID=1
DEMO_ESCROW_ADDRESS=0x75537828f2ce51be7289709686A69CbFDbB714F1
```

### Test Oracle Keys (Hardhat defaults)

```
Oracle (account 5): 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
Creator (account 1): 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

---

## 📋 Token Flow Summary

### Campaign Success

```
Creator → Factory → Escrow → Aave (bond)
Pledgers → Escrow → Aave (pledges)
Vouchers → Escrow → Aave (stakes)

[Oracle: verifyAndRelease(true)]

Aave → Escrow → Creator (pledges + bond - 1% fee)
Aave → Escrow → Treasury (fee + yield)
Aave → Escrow → Vouchers (full refund)
```

### Campaign Failure

```
[Oracle: verifyAndRelease(false)]

Aave → Escrow → Pledgers (full refund)
Aave → Escrow → Treasury (bond + yield + voucher slash)
Aave → Escrow → Vouchers (50% slashed)
```

---

## 🚀 Next Steps for Live Demo

### 1. Deploy to Amoy Testnet

```bash
# Set env vars
export POLYGON_AMOY_RPC_URL="https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY"
export DEPLOYER_PRIVATE_KEY="0x..."
export USDC_ADDRESS="0x..." # Amoy USDC
export AAVE_POOL_ADDRESS="0x..." # Amoy Aave

# Deploy factory
npm run deploy:factory:amoy
```

### 2. Configure Oracle Wallet

- Add `NUXT_ORACLE_PRIVATE_KEY` to `.dev.vars`
- Grant `ORACLE_ROLE` on deployed escrow contract
- Ensure oracle wallet has MATIC for gas

### 3. Take Demo Photos

- Photo 1: Paper with "chainlink" written 1 time (baseline)
- Photo 2: Paper with "chainlink" written 20 times (completion)
- Clear handwriting, good lighting

### 4. Run End-to-End Demo

1. Create campaign via UI
2. Upload baseline photo → sets `baseline_evidence_id`
3. Upload completion photo → sets `completion_evidence_id`
4. Click "Run AI Verification"
5. Watch: AI analysis → DB update → Oracle tx → Funds release

---

## 📝 Key Files Reference

### Backend

| File                                    | Purpose                  |
| --------------------------------------- | ------------------------ |
| `api/campaigns/[id]/baseline.post.ts`   | Set baseline evidence    |
| `api/campaigns/[id]/completion.post.ts` | Set completion evidence  |
| `api/cre/verify-completion.post.ts`     | Trigger AI + oracle      |
| `api/ai/vision-verify.post.ts`          | GPT-4o Vision proxy      |
| `server/utils/oracle.ts`                | viem-based oracle client |

### Frontend

| File                                              | Purpose              |
| ------------------------------------------------- | -------------------- |
| `components/evidence/VerificationCard.vue`        | Main verification UI |
| `components/evidence/VerificationStatusBadge.vue` | Status indicator     |
| `pages/campaigns/[id].vue`                        | Campaign detail page |

### Contracts

| File                                    | Purpose                        |
| --------------------------------------- | ------------------------------ |
| `contracts/PledgeEscrow.sol`            | Per-campaign escrow            |
| `contracts/CampaignFactory.sol`         | Factory for creating campaigns |
| `test/pledgeEscrow.integration.test.ts` | Full workflow tests            |
| `scripts/deployLocal.ts`                | Local deployment script        |

### Documentation

| File                        | Purpose                 |
| --------------------------- | ----------------------- |
| `docs/TOKEN-FLOWS.md`       | Token flow architecture |
| `docs/CRE-VISION-DESIGN.md` | CRE integration design  |
