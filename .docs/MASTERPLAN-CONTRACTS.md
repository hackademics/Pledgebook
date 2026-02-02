# MASTERPLAN — Smart Contracts

## Contract Set

- `CampaignFactory.sol`
- `PledgeEscrow.sol`

---

## Folder Layout

- blockchain/contracts/
  - contracts/
    - CampaignFactory.sol
    - PledgeEscrow.sol
  - scripts/
    - deployFactory.ts
    - preflight.ts
  - test/
    - campaignFactory.test.ts

---

## Key Structs & Interfaces

### `Campaign` (PledgeEscrow)

- `id: uint256`
- `creator: address`
- `endDate: uint256`
- `promptHash: bytes32`
- `status: string`
- `creatorBond: uint256`
- `amountPledged: uint256`
- `totalVouched: uint256`
- `totalDisputed: uint256`
- `fundraisingGoal: uint256`
- `privacyMode: bool`
- `isDisputed: bool`
- `fraudFlagged: bool`
- mappings: `pledges`, `vouchers`, `disputers`
- arrays: `pledgers`, `voucherList`, `disputerList`

---

## Critical Functions

### `CampaignFactory.createCampaign(...)`

- Validates bond.
- Transfers bond to escrow.
- Emits `CampaignCreated`.

### `PledgeEscrow.pledge(amount)`

- Requires `status == active`.
- Transfers USDC from pledger.
- Updates mapping + array.
- Deposits to Aave.

### `PledgeEscrow.vouch(amount)`

- Same flow as pledge but for vouchers.

### `PledgeEscrow.dispute(amount, reason)`

- Requires within dispute window.
- Transfers stake to escrow.
- Flags `isDisputed` if threshold exceeded.

### `PledgeEscrow.verifyAndRelease(success, promptHash)`

- Only CRE oracle.
- Checks end date + prompt hash.
- Withdraws from Aave.
- Distributes funds based on success/failure.

---

## Security Protocols

- Use OpenZeppelin `SafeERC20`, `ReentrancyGuard`, `Ownable`.
- Ensure `verifyAndRelease` restricted to `creOracle`.
- No unbounded loops without batching guardrails.
- Use constant basis points for fees and yields.

---

## Tests (Hardhat)

### Unit Tests

- `createCampaign` with bond + events.
- `pledge`, `vouch`, `dispute` state changes.
- `verifyAndRelease` success/failure paths.

### Integration Tests

- Fork Polygon: deposit to Aave + withdraw.
- Gas profiling for 100 pledgers.

---

## Deployment Checklist

- Verify USDC address.
- Verify Aave pool address.
- Configure CRE oracle address.
- Verify fee constants.
