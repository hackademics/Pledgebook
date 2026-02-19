# Pledgebook Token Flow Architecture

## Overview

This document maps all USDC token flows between wallets, contracts, and the Aave yield pool.

## Actors

| Actor         | Role                                     | Address                     |
| ------------- | ---------------------------------------- | --------------------------- |
| **Creator**   | Creates campaigns, posts bond            | EOA                         |
| **Pledger**   | Backs campaigns with funds               | EOA                         |
| **Voucher**   | Stakes reputation on creator success     | EOA                         |
| **Disputer**  | Stakes to challenge fraudulent campaigns | EOA                         |
| **Oracle**    | CRE oracle that calls verifyAndRelease   | EOA (controlled by backend) |
| **Treasury**  | Receives fees, slashed funds, yield      | EOA/Multisig                |
| **Factory**   | Creates escrow contracts                 | Contract                    |
| **Escrow**    | Holds campaign funds                     | Contract (one per campaign) |
| **Aave Pool** | Generates yield on deposited USDC        | External Contract           |

---

## Token Flow Diagrams

### Phase 1: Campaign Creation

```
┌──────────┐    bondAmount     ┌─────────┐    bondAmount     ┌────────┐
│  Creator │ ──────────────▶  │ Factory │ ──────────────▶  │ Escrow │
└──────────┘   (via approve)   └─────────┘                   └────────┘
                                                                  │
                                                                  ▼
                                                            ┌──────────┐
                                                            │ Aave Pool│
                                                            └──────────┘
```

**Flow:**

1. Creator calls `USDC.approve(factory, bondAmount)`
2. Creator calls `Factory.createCampaign(..., bondAmount, ...)`
3. Factory transfers bond from Creator → Factory
4. Factory deploys new Escrow contract
5. Factory transfers bond from Factory → Escrow
6. Creator calls `Escrow.approveCampaign()` (activates campaign)
7. Escrow deposits bond into Aave for yield

---

### Phase 2: Active Campaign

```
┌──────────┐    pledgeAmount    ┌────────┐    pledgeAmount    ┌──────────┐
│ Pledger  │ ───────────────▶  │ Escrow │ ───────────────▶  │ Aave Pool│
└──────────┘                    └────────┘                    └──────────┘

┌──────────┐    vouchAmount     ┌────────┐    vouchAmount     ┌──────────┐
│ Voucher  │ ───────────────▶  │ Escrow │ ───────────────▶  │ Aave Pool│
└──────────┘                    └────────┘                    └──────────┘

┌──────────┐    disputeAmount   ┌────────┐    disputeAmount   ┌──────────┐
│ Disputer │ ───────────────▶  │ Escrow │ ───────────────▶  │ Aave Pool│
└──────────┘                    └────────┘                    └──────────┘
```

**Constraints:**

- `pledgeAmount >= MIN_PLEDGE` (1 USDC)
- `vouchAmount > 0`
- `disputeAmount > 0`
- All deposits immediately go to Aave for yield
- Campaign must be `Active` status
- `block.timestamp < endDate`

---

### Phase 3: Verification & Settlement

#### Scenario A: Campaign SUCCESS (Oracle calls `verifyAndRelease(true)`)

```
┌──────────┐   withdraw all    ┌────────┐
│ Aave Pool│ ──────────────▶  │ Escrow │
└──────────┘                   └────────┘
      │                             │
      │                    ┌───────┴───────┬───────────────┐
      ▼                    ▼               ▼               ▼
  yieldEarned      creatorClaimable   treasuryFee    disputerSlash
      │                    │               │               │
      ▼                    ▼               ▼               ▼
┌──────────┐        ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Treasury │        │  Creator │    │ Treasury │    │ Treasury │
└──────────┘        └──────────┘    └──────────┘    └──────────┘
```

**Distribution:**
| Recipient | Amount | Formula |
|-----------|--------|---------|
| Creator | `amountPledged + creatorBond - treasuryFee` | Via `claimCreator()` |
| Treasury | `treasuryFee + yieldEarned + disputerSlash` | Via `claimTreasury()` |
| Vouchers | Full vouch amount (no slash) | Via `claimVoucher()` |
| Disputers | 50% of stake (frivolous) | Via `claimDisputeStake()` |

#### Scenario B: Campaign FAILURE (Oracle calls `verifyAndRelease(false)`)

```
┌──────────┐   withdraw all    ┌────────┐
│ Aave Pool│ ──────────────▶  │ Escrow │
└──────────┘                   └────────┘
      │                             │
      │                    ┌───────┴───────┬───────────────┐
      ▼                    ▼               ▼               ▼
  yieldEarned        pledgerRefund    creatorBond    voucherSlash
      │                    │               │               │
      ▼                    ▼               ▼               ▼
┌──────────┐        ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Treasury │        │ Pledgers │    │ Treasury │    │ Treasury │
└──────────┘        └──────────┘    └──────────┘    └──────────┘
```

**Distribution:**
| Recipient | Amount | Formula |
|-----------|--------|---------|
| Pledgers | Full pledge amount | Via `claimPledgeRefund()` |
| Treasury | `creatorBond + yieldEarned + voucherSlash` | Via `claimTreasury()` |
| Vouchers | 50% of stake (slashed for vouching fraud) | Via `claimVoucher()` |
| Disputers | Full stake (dispute valid) | Via `claimDisputeStake()` |

#### Scenario C: Emergency Finalization (Oracle timeout)

Same as Scenario B, but:

- `fraudFlagged = false` (vouchers NOT slashed)
- Triggered by anyone after `endDate + 30 days`

---

## State Machine

```
                    createCampaign()
                          │
                          ▼
                      ┌───────┐
                      │ Draft │
                      └───┬───┘
                          │ approveCampaign()
                          ▼
                      ┌───────┐
           ┌──────────│Active │──────────┐
           │          └───┬───┘          │
           │              │              │
    dispute > 10%    verifyAndRelease()  emergencyFinalize()
           │              │              │
           ▼              │              │
       ┌────────┐         │              │
       │Disputed│─────────┼──────────────┤
       └────────┘         │              │
                          │              │
              ┌───────────┴───────────┐  │
              │                       │  │
        success=true            success=false
              │                       │  │
              ▼                       ▼  ▼
         ┌────────┐              ┌────────┐
         │Complete│              │ Failed │
         └────────┘              └────────┘
```

---

## Economic Security

### Slashing Rules

| Actor    | Success                      | Failure (Fraud) | Failure (Timeout) |
| -------- | ---------------------------- | --------------- | ----------------- |
| Creator  | Gets pledges + bond - 1% fee | Loses bond      | Loses bond        |
| Pledger  | N/A (funds go to creator)    | Full refund     | Full refund       |
| Voucher  | Full refund                  | 50% slashed     | Full refund       |
| Disputer | 50% slashed                  | Full refund     | Full refund       |

### Flash Loan Protection

- `snapshotPledged` taken at first dispute after `endDate`
- Dispute threshold calculated against snapshot, not live `amountPledged`
- Prevents attacker from inflating `amountPledged` to dilute dispute ratio

---

## Claim Function Summary

| Function              | Who Can Call | When               | What They Get          |
| --------------------- | ------------ | ------------------ | ---------------------- |
| `claimCreator()`      | Creator      | After SUCCESS      | pledges + bond - fee   |
| `claimTreasury()`     | Treasury     | After finalization | fees + yield + slashes |
| `claimPledgeRefund()` | Pledgers     | After FAILURE      | Full pledge            |
| `claimVoucher()`      | Vouchers     | After finalization | 50-100% of vouch       |
| `claimDisputeStake()` | Disputers    | After finalization | 50-100% of stake       |

---

## CRE Integration

### Oracle Workflow

```
┌─────────┐   POST /verify-completion   ┌─────────┐   verifyAndRelease()   ┌────────┐
│ Backend │ ─────────────────────────▶ │ Oracle  │ ─────────────────────▶│ Escrow │
└─────────┘                            │ Wallet  │                        └────────┘
     ▲                                  └─────────┘
     │
     │  AI Vision Analysis
     │
┌─────────┐
│ OpenAI  │
│ GPT-4o  │
└─────────┘
```

**Current (Demo) Implementation:**

1. Backend receives baseline + completion images
2. Backend calls OpenAI Vision directly (no CRE network)
3. Backend uses oracle wallet to call `verifyAndRelease(success, promptHash)`

**Production Implementation:**

1. Backend triggers CRE workflow
2. CRE nodes independently call vision endpoint
3. CRE reaches consensus on verdict
4. CRE oracle calls `verifyAndRelease()` on-chain

---

## Constants

```solidity
MIN_BOND = 10 * 10^6           // 10 USDC
MIN_PLEDGE = 1 * 10^6          // 1 USDC
MIN_CAMPAIGN_DURATION = 1 day
DISPUTE_WINDOW = 7 days
DISPUTE_THRESHOLD_BPS = 1000   // 10%
TREASURY_FEE_BPS = 100         // 1%
FINALIZATION_GRACE_PERIOD = 30 days
VOUCHER_SLASH_BPS = 5000       // 50%
DISPUTER_SLASH_BPS = 5000      // 50%
```

---

## Gas Optimization Notes

- All deposits batch into single Aave `supply()` call per transaction
- Single `withdraw(type(uint256).max)` at finalization
- No loops in claim functions (single-user pattern)
- Events emitted for off-chain indexing
