# Pledgebook Smart Contract Security Audit Report

**Date:** February 1, 2026  
**Auditor:** Internal Security Review  
**Contracts:** PledgeEscrow.sol, CampaignFactory.sol  
**Solidity Version:** 0.8.20  
**OpenZeppelin Version:** 5.4.0

---

## Executive Summary

This report documents the security audit of the Pledgebook smart contracts. The contracts implement a pledge-based crowdfunding system with:

- Creator bonds and campaign creation
- Pledger deposits with Aave yield generation
- Vouching and dispute mechanisms with economic slashing
- Oracle-based campaign verification

### Overall Assessment: **MEDIUM RISK**

The contracts use best-practice OpenZeppelin libraries and proper security patterns. Several critical issues were identified and fixed during this audit.

---

## Audit Scope

| Contract            | Lines | Complexity      |
| ------------------- | ----- | --------------- |
| PledgeEscrow.sol    | 417   | High            |
| CampaignFactory.sol | 106   | Low             |
| MockAavePool.sol    | 35    | Low (test only) |
| MockUSDC.sol        | 17    | Low (test only) |

---

## Security Tools Results

### Slither Analysis

**Final Results:** 12 findings (down from 26 after fixes)

| Finding Type              | Count | Status                                  |
| ------------------------- | ----- | --------------------------------------- |
| Reentrancy (benign)       | 1     | Accepted - protected by ReentrancyGuard |
| Timestamp comparisons     | 7     | Accepted - required for deadline logic  |
| Unused return value       | 1     | Accepted - using balance diff method    |
| Event after external call | 1     | Informational                           |
| Unindexed event params    | 2     | Mock contracts only                     |

---

## Security Controls Verified ✅

### OpenZeppelin Libraries Used

| Library           | Purpose                       | Status                  |
| ----------------- | ----------------------------- | ----------------------- |
| `AccessControl`   | Role-based permissions        | ✅ Properly implemented |
| `Pausable`        | Emergency pause functionality | ✅ Properly implemented |
| `ReentrancyGuard` | Prevent reentrancy attacks    | ✅ Properly implemented |
| `SafeERC20`       | Safe token transfers          | ✅ Properly implemented |

### Best Practices Verified

- [x] CEI Pattern (Checks-Effects-Interactions) followed
- [x] ReentrancyGuard on all external state-changing functions
- [x] Input validation on all parameters
- [x] Event emission for all state changes
- [x] Immutable variables where appropriate
- [x] No floating pragma (pinned to 0.8.20)

---

## Issues Found & Fixed

### 🔴 CRITICAL: Fund Accounting Mismatch (FIXED)

**Location:** [PledgeEscrow.sol#L230-L244](../blockchain/contracts/contracts/PledgeEscrow.sol)

**Issue:** Treasury fee was taken from pledger funds even on failed campaigns, causing pledgers to not receive full refunds.

**Before:**

```solidity
uint256 treasuryFee = (amountPledged * TREASURY_FEE_BPS) / 10_000;
treasuryClaimable += treasuryFee;  // Always taken!

if (success) {
    creatorClaimable = amountPledged + creatorBond - treasuryFee;
} else {
    treasuryClaimable += creatorBond;
}
```

**After (Fixed):**

```solidity
if (success) {
    uint256 treasuryFee = (amountPledged * TREASURY_FEE_BPS) / 10_000;
    treasuryClaimable += treasuryFee;
    creatorClaimable = amountPledged + creatorBond - treasuryFee;
} else {
    // No fee on failed campaigns - pledgers get full refund
    treasuryClaimable += creatorBond;
}
```

---

### 🟡 MEDIUM: No Minimum Campaign Duration (FIXED)

**Location:** [PledgeEscrow.sol#L111](../blockchain/contracts/contracts/PledgeEscrow.sol), [CampaignFactory.sol#L50](../blockchain/contracts/contracts/CampaignFactory.sol)

**Issue:** Campaigns could be created with very short durations, enabling flash-loan or front-running attacks.

**Fix Applied:**

```solidity
uint256 public constant MIN_CAMPAIGN_DURATION = 1 days;
require(endDate > block.timestamp + MIN_CAMPAIGN_DURATION, "Campaign too short");
```

---

### 🟡 MEDIUM: No Minimum Pledge Amount (FIXED)

**Location:** [PledgeEscrow.sol#L153](../blockchain/contracts/contracts/PledgeEscrow.sol)

**Issue:** Users could pledge as little as 1 wei, bloating storage and enabling dust attacks.

**Fix Applied:**

```solidity
uint256 public constant MIN_PLEDGE = 1 * 10 ** 6; // 1 USDC
require(amount >= MIN_PLEDGE, "Pledge too small");
```

---

### 🟡 MEDIUM: Missing Prompt Hash Validation in Factory (FIXED)

**Location:** [CampaignFactory.sol#L50](../blockchain/contracts/contracts/CampaignFactory.sol)

**Issue:** Factory didn't validate promptHash before transferring bonds.

**Fix Applied:**

```solidity
require(promptHash != bytes32(0), "Invalid prompt hash");
```

---

## Known Risks (Accepted)

### 🟠 HIGH: Oracle Centralization

**Status:** Documented, not fixed  
**Location:** `verifyAndRelease()` function

The CRE oracle has full control over campaign outcomes. This is a design choice for the MVP that relies on Chainlink's reputation.

**Mitigation:**

- Use Chainlink CRE with DON consensus
- Add time-lock for mainnet deployment
- Consider multi-oracle pattern for high-value campaigns

---

### 🟠 HIGH: Admin Emergency Withdrawal

**Status:** Documented with warning  
**Location:** `emergencyWithdraw()` function

Admin (factory) can pause and withdraw USDC. This is an accepted risk for emergency recovery.

**Mitigation Added:**

- Clear documentation in function NatSpec
- Only allowed when paused
- Emit EmergencyWithdrawal event for transparency

---

### 🟡 MEDIUM: Factory Config Changes Don't Propagate

**Status:** Documented  
**Location:** `setCreOracle()`, `setTreasury()` on factory

When factory admin changes oracle/treasury, existing escrows keep old values.

**Current Behavior:** Intentional - each escrow is immutable after creation
**Alternative:** Registry pattern (not implemented for simplicity)

---

## Test Coverage

```
----------------------|----------|----------|----------|----------|
File                  |  % Stmts | % Branch |  % Funcs |  % Lines |
----------------------|----------|----------|----------|----------|
 CampaignFactory.sol  |    63.64 |    28.57 |    33.33 |    66.67 |
 PledgeEscrow.sol     |    89.43 |    52.27 |    73.68 |    90.59 |
----------------------|----------|----------|----------|----------|
All files             |    85.90 |    49.05 |    66.67 |    86.92 |
----------------------|----------|----------|----------|----------|
```

### Test Cases Passing (23 tests)

**Core Functionality:**

- ✅ Pledge, vouch, dispute flow
- ✅ Fund release on success + creator claim
- ✅ Pledger refunds on failure
- ✅ Emergency finalization after grace period
- ✅ Voucher slashing on fraud
- ✅ Disputer slashing on frivolous disputes
- ✅ Flash-loan protection snapshot

**Edge Cases:**

- ✅ Multiple pledgers claim refund - all get full amount
- ✅ Pledgers claiming in random order
- ✅ Double-claim prevention
- ✅ Exactly 10% dispute threshold (no trigger)
- ✅ 10% + 1 wei dispute threshold (triggers)
- ✅ Large pledge amount threshold calculation
- ✅ Campaign duration at MIN_CAMPAIGN_DURATION (rejected)
- ✅ Campaign duration just over MIN_CAMPAIGN_DURATION (accepted)
- ✅ Pledge below MIN_PLEDGE (rejected)
- ✅ Pledge at MIN_PLEDGE (accepted)

**Invariant Tests:**

- ✅ Total claimable never exceeds balance (success scenario)
- ✅ Total claimable never exceeds balance (failure scenario)

**Fuzz-like Tests:**

- ✅ Various pledge amounts (1 USDC to 99,999 USDC)
- ✅ Pledge timing (start, middle, near-end, post-deadline)

### Tests Not Yet Implemented

1. True fuzz testing with randomized inputs (use Foundry)
2. Stateful invariant testing across multiple transactions
3. Gas optimization benchmarks with 1000+ pledgers

---

## Fund Flow Verification

### Deposit Flow ✅

```
Creator Bond → PledgeEscrow → Aave Pool (yield generating)
Pledger Funds → PledgeEscrow → Aave Pool (yield generating)
Voucher Funds → PledgeEscrow → Aave Pool (yield generating)
Disputer Funds → PledgeEscrow → Aave Pool (yield generating)
```

### Withdrawal Flow (Success) ✅

```
Aave Pool → PledgeEscrow
  ├── Creator: pledges + bond - 1% fee
  ├── Treasury: 1% fee + yield
  ├── Vouchers: full refund
  └── Disputers: 50% slashed (frivolous)
```

### Withdrawal Flow (Failure) ✅

```
Aave Pool → PledgeEscrow
  ├── Pledgers: full refund
  ├── Treasury: creator bond + yield + 50% of voucher stakes
  ├── Vouchers: 50% slashed (backed fraud)
  └── Disputers: full refund
```

---

## Wallet Setup Instructions

### For Local Testing

No wallet setup needed - Hardhat provides 20 test accounts automatically.

### For Polygon Amoy Testnet

1. **Create Test Wallets:**

```bash
# Generate a new mnemonic (ONLY for testnet!)
npx hardhat node --show-stack-traces

# Or use cast (Foundry)
cast wallet new
```

2. **Fund Test Wallets:**

- Get MATIC from Polygon Faucet: https://faucet.polygon.technology/
- Get test USDC from Amoy USDC faucet (if available)

3. **Configure .env:**

```env
DEPLOYER_PRIVATE_KEY=<your_testnet_private_key>
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
EXPECTED_CHAIN_ID=80002

# Testnet addresses
USDC_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
AAVE_POOL_ADDRESS=<mock_pool_after_deployment>
CRE_ORACLE_ADDRESS=<your_oracle_eoa_for_testing>
TREASURY_ADDRESS=<your_treasury_eoa>
```

### For Polygon Mainnet

**⚠️ IMPORTANT: Use hardware wallet or multisig for mainnet!**

1. Use Ledger/Trezor via Frame or browser extension
2. Deploy with minimal funds, transfer ownership to multisig
3. Use Gnosis Safe for treasury and admin

---

## Security Tool Setup

### Install Slither

```bash
pip install slither-analyzer
cd blockchain/contracts
pnpm run analyze:slither
```

### Install Mythril

```bash
pip install mythril
cd blockchain/contracts
pnpm run analyze:mythril
```

### Expected Output

See configuration files:

- [slither.config.json](../blockchain/contracts/slither.config.json)
- [mythril.config.json](../blockchain/contracts/mythril.config.json)

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass: `pnpm test`
- [ ] Coverage > 85%: `pnpm coverage`
- [ ] Slither clean: `pnpm run analyze:slither`
- [ ] Mythril clean: `pnpm run analyze:mythril`
- [ ] Preflight passes: `pnpm run preflight:amoy`
- [ ] .env configured with correct addresses
- [ ] DRY_RUN=true first pass

### Deployment

- [ ] Deploy MockAavePool (testnet only)
- [ ] Deploy CampaignFactory
- [ ] Verify contracts on Polygonscan
- [ ] Transfer ownership to multisig (mainnet)
- [ ] Set CRE_ORACLE_ADDRESS after CRE workflow deployment

### Post-Deployment

- [ ] Create test campaign
- [ ] Verify pledge flow works
- [ ] Verify oracle can call verifyAndRelease
- [ ] Test emergency pause/unpause

---

## Recommendations

### Immediate (Before Launch)

1. ✅ Fixed fund accounting bug
2. ✅ Added minimum campaign duration
3. ✅ Added minimum pledge amount
4. ✅ Added prompt hash validation

### Short-Term (Before Mainnet)

1. Implement multi-oracle pattern or timelock for `verifyAndRelease`
2. Add invariant tests for fund accounting
3. Consider `AccessControlDefaultAdminRules` for 2-step admin transfer
4. Run full Slither/Mythril analysis

### Long-Term

1. Formal verification of fund accounting
2. Bug bounty program
3. Third-party audit
4. Insurance/coverage for user funds

---

## Appendix: Contract Architecture

```
CampaignFactory (Admin)
├── Creates PledgeEscrow instances
├── Manages global oracle/treasury
└── Pause/unpause all new campaigns

PledgeEscrow (Per Campaign)
├── Roles: CREATOR_ROLE, ORACLE_ROLE, DEFAULT_ADMIN (factory)
├── States: Draft → Active → Complete/Failed/Disputed
├── Aave integration for yield
└── Economic incentives via slashing
```
