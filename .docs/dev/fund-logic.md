### Singular Vision for PledgeBook: Overall Workflow and Funds Management

PledgeBook is a decentralized, verifiable fundraising platform that transforms traditional donations into outcome-based incentives, ensuring "truth > trust" through blockchain enforcement and AI-driven consensus. At its core, it enables creators to set measurable goals (e.g., "get straight A's" or "reduce crime by 20%"), attract pledges in USDC, and have funds released only upon proven success—or refunded automatically on failure. This creates a self-regulating ecosystem where economic incentives (bonds, stakes, yields) deter fraud and reward honesty, while smart contracts handle funds flow with transparency and automation.

The platform's innovation lies in linking off-chain verification (AI consensus via CRE) with on-chain execution (Polygon smart contracts), making manipulation costly and detection inevitable. Funds are always tracked immutably on-chain, with every transfer emitting events for auditing. CRE acts as the "brain," orchestrating verification and triggering contract actions, while the PledgeBook website (Nuxt frontend) provides user-friendly interfaces for interaction.

#### Key Actors and Their Roles

- **Creator**: Initiates campaigns, defines goals/prompts, posts bond for legitimacy. Benefits from released funds on success.
- **Pledger**: Donates USDC to support campaigns; funds escrowed until resolution. Receives refunds on failure, with optional yields.
- **Endorser (Voucher)**: Stakes USDC to attest legitimacy; earns yields/rewards on success, forfeits on fraud.
- **Disputer**: Stakes USDC to challenge fraud; earns forfeited bonds on upheld disputes, forfeits on false claims.
- **Verifier/Admin (Automated via CRE)**: System role for approval and dispute resolution; human override via multisig for edge cases.
- **System (Smart Contracts + CRE)**: Enforces rules, holds escrow, distributes funds; CRE handles AI consensus and callbacks.

Actors interact via the website (wallet-connected), with all financial actions on-chain.

#### Overall Workflow: High-Level Processes

The workflow is linear but with branches for disputes. Each step updates campaign status (Draft → Submitted → Approved → Active → Complete/Failed/Disputed), with funds flow tied to state transitions.

1. **Campaign Creation**:
   - Creator connects wallet, fills form (name, goal, end date, rules, prompt, slug, etc.).
   - System generates prompt hash (keccak256) for immutability, uploads to IPFS.
   - Creator posts bond (e.g., 1% of goal, min $10 USDC) to escrow contract.
   - Campaign submitted as Draft; stored in D1 (off-chain metadata) + on-chain via factory contract.
   - Validation: AI pre-checks prompt for objectivity (via CRE mini-workflow); admin approves if clear.

2. **Campaign Validation and Activation**:
   - CRE workflow: Fetches prompt/sources, runs initial AI scan for fraud risks (e.g., vague language).
   - If approved: Status → Approved → Active; escrow contract deployed/instantiated.
   - Public listing: Campaign discoverable on site (tags, search, showcased).
   - Funds flow: Creator bond locked in escrow; no pledges yet.

3. **Pledge Posting and Acceptance**:
   - Pledger views campaign, connects wallet, enters amount + optional message.
   - Contract: Approves USDC spend, calls `pledge()` — transfers to escrow, updates amountPledged, adds to pledgers list.
   - Acceptance: Instant if campaign Active; CRE optional pre-check for pledger KYC (if regulated).
   - Storage: On-chain mapping; off-chain D1 insert for pledge record (tx_hash for audit).
   - Funds flow: Pledged USDC locked in escrow; auto-deposit to Aave (yield protocol) for passive interest.

4. **Endorsers (Vouchers) Participation**:
   - Endorser stakes USDC via `vouch()` function during Active phase.
   - Contract: Transfers stake to escrow, adds to vouchers mapping/totalVouched.
   - Incentives: Stake earns pro-rata yields; returned + bonus on success.
   - Funds flow: Voucher stakes deposited to same Aave pool as pledges for unified yield.

5. **Disputers Participation**:
   - Disputer stakes via `dispute()` during dispute window (e.g., post-endDate + 7 days).
   - Contract: Transfers stake, updates totalDisputed; flags isDisputed if threshold (e.g., 10% of pledged).
   - Triggers CRE re-verification workflow if flagged.
   - Funds flow: Disputer stakes held separately (non-yielding to avoid incentives for false disputes).

6. **Campaign Auditing and Consensus (CRE Integration)**:
   - At endDate: CRE time-based trigger fetches campaign data (promptHash, evidence IPFS).
   - AI consensus: Parallel calls to Claude/Gemini/Grok with full prompt + evidence; aggregate TRUE/FALSE + reasoning (threshold ≥2/3).
   - CRE callback to contract: `verifyAndRelease(success, promptHash)`; logs consensusResults on-chain/D1.
   - If disputed: CRE runs enhanced verification (extra sources/AI scrutiny); resolves fraud flag.

7. **Donation Distribution and Refunds**:
   - On success (TRUE): Contract withdraws from Aave (principal + yield); releases to creator (pledged + bond + yields); vouchers get stake + pro-rata yield bonus; disputers forfeit if any.
   - On failure/Fraud (FALSE): Refunds pledgers (principal + pro-rata yield); creator/voucher bonds forfeited to disputers/treasury; disputers get stake back.
   - Funds flow: All via SafeERC20 transfers; yields calculated as (aToken balance - principal).
   - Final log: Update history, consensusResults in D1/on-chain.

8. **Post-Resolution**:
   - Status → Complete/Failed; campaign archived.
   - Pledgers/creators notified via site (websocket or polling).
   - Audit trail: Full history queryable via site (The Graph indexer for on-chain events).

#### Funds Tracking, Storage, and Distribution

- **Tracking**: On-chain (mappings for pledges/vouchers/disputers, amountPledged/totalVouched/totalDisputed); off-chain D1 mirrors for fast queries/UI (sync via events). Yields tracked via Aave aToken balance.
- **Storage**: Escrow contract holds USDC; auto-deposited to Aave Polygon pool (stable, audited). No platform custody—contract-owned.
- **Distribution**: Automated via CRE callback to contract functions; pro-rata calculations in loops (gas-optimized with batching). Treasury (multisig) receives 1% fee on releases/forfeits for sustainability.
- **Innovation**: Yields make escrow "productive" (unique to DeFi); bonds/stakes create economic barriers to fraud without high entry costs (scaled to goal).

#### Linkages Between Components

- **Website (Nuxt) → Smart Contracts**: Wagmi writeContract for pledge/vouch/dispute; readContract for status/amounts.
- **Smart Contracts → CRE**: Events (e.g., DeadlineReached) trigger CRE workflows; CRE callbacks to contract (onlyAuthorized).
- **CRE → AI/APIs**: HTTP steps in workflows fetch evidence/call AIs; consensus aggregation.
- **D1/R2/IPFS**: Nuxt API routes sync off-chain (e.g., store prompt IPFS hash); R2 for images.
- **Wallet/Auth**: SIWE middleware guards actions; RBAC checks in contracts (e.g., creatorOnly).

This cohesive workflow ensures funds are secure, traceable, and automatically managed, minimizing fraud through incentives and verifiability. For CRE consensus workflows in the next step, we'll define the detailed AI prompt execution and aggregation logic.

# PledgeBook Product Development Document (Continued)

## Phase 10: Solidity Contracts and Financial Management Workflow

**Objective**: Coalesce all knowledge on PledgeBook's actors, processes, and financial mechanics into a unified smart contract framework on Polygon. This phase defines how contracts manage donations (pledges), escrow, yield generation (via integrated lending like Aave), fund distributions, forfeits, rewards, and refunds. The workflow tracks each actor's wallet, actions, and interactions in a trustless, auditable manner, ensuring "truth > trust" through immutable state transitions, events for off-chain indexing, and CRE callbacks for verification. Contracts are designed for security (OpenZeppelin), efficiency (gas-optimized loops), and scalability (factory pattern for per-campaign escrows).

**Deliverables**:

- Actor definitions and roles.
- Detailed financial workflow steps with funds tracking.
- Solidity contract structures and code snippets.
- Integration points with CRE and web layer.

**Standards, Patterns, Conventions, and Best Practices** (Carmack-Inspired):

- **Actor-Centric Design**: Mappings keyed by wallet address for pledges/vouchers/disputers; events for every action (e.g., Pledged, Vouched, Disputed). Carmack: "Track state explicitly; make audits simple with clear logs."
- **Funds Flow**: All USDC via SafeERC20; escrow per campaign; yields auto-deposited/withdrawn. No direct admin access to funds (multisig treasury).
- **State Transitions**: Finite state machine for campaigns (Draft → Active → Resolved); revert on invalid states.
- **Yield Generation**: Integrate Aave for passive interest on escrow (principal untouched); pro-rata distribution.
- **Forfeits/Rewards**: Automated on resolution; forfeits to winners/treasury (1% fee).
- **Security**: ReentrancyGuard, Pausable, Ownable2Step; cap loops (e.g., batch refunds); Slither-audited.
- **Efficiency**: Use arrays for iteration only when needed; mappings for O(1) lookups.
- **Testing Gate**: Hardhat 100% coverage; fork Polygon mainnet for yield simulations. Junior task: Test pledge → vouch → resolve success path.

### 10.1: Key Actors and Their Wallets/Interactions

- **Creator**: Wallet address creates campaign, posts bond, receives releases. Actions: Submit goal/prompt, update draft. Tracked: creatorAddress in Campaign; bond in escrow.
- **Donor (Pledger)**: Wallet pledges USDC to escrow. Actions: Approve/transfer, optional message. Tracked: pledges mapping (address → amount); pledgers array for refunds.
- **Voucher (Endorser)**: Wallet stakes to endorse legitimacy. Actions: Vouch with amount. Tracked: vouchers mapping; voucherList for rewards.
- **Disputer**: Wallet stakes to challenge fraud. Actions: Dispute with amount/reason. Tracked: disputers mapping; disputerList for forfeits.
- **System/Admin (Multisig)**: Wallet (or CRE-authorized) approves campaigns, resolves edge disputes. Tracked: Ownable contract owner.
- **Escrow Wallet (Contract)**: Per-campaign contract address holds funds (pledges + bonds + stakes); integrates Aave for yields. Tracked: balanceOf(this) for total; aToken balance for yields.

All actors interact via wallet signatures; no email/password. Funds tracked in real-time via events (indexed for The Graph querying in web UI).

### 10.2: Detailed Financial Workflow with Funds Tracking

The workflow is event-driven, with CRE callbacks for verification. Funds (USDC) are tracked at every step: deposited to escrow, yielded via Aave, distributed/forfeited on resolution. All transfers emit events for web syncing (e.g., pledge total updates).

1. **Campaign Creation (Creator Action)**:
   - Creator submits via web (wallet sign); posts bond (e.g., 1% goal).
   - Contract: Factory deploys EscrowContract; transfers bond to escrow.
   - Funds Track: Bond locked (creatorBond += amount); yield deposit starts (Aave supply).
   - Event: CampaignCreated(id, creator, bondAmount).

2. **Campaign Approval (Admin/CRE)**:
   - CRE validates prompt/sources; admin multisig approves if needed.
   - Contract: Status → Active; escrow activated.
   - Funds Track: No change; yields accrue from bond.
   - Event: CampaignApproved(id).

3. **Pledging (Donor Action)**:
   - Donor approves USDC, pledges amount via web.
   - Contract: TransferFrom to escrow; update pledges mapping/amountPledged; add to pledgers list. Deposit to Aave for yield.
   - Funds Track: amountPledged += amount; totalEscrow = balance + aTokenYield.
   - Event: Pledged(id, pledger, amount).

4. **Vouching (Voucher Action)**:
   - Voucher stakes via web.
   - Contract: TransferFrom to escrow; update vouchers mapping/totalVouched; add to voucherList; deposit to Aave.
   - Funds Track: totalVouched += amount; yields shared pool.
   - Event: Vouched(id, voucher, amount).

5. **Disputing (Disputer Action)**:
   - Disputer stakes + reason via web (during window).
   - Contract: TransferFrom to escrow (separate non-yielding pool); update disputers mapping/totalDisputed; flag isDisputed if threshold. Triggers CRE re-verification.
   - Funds Track: totalDisputed += amount (held separately to avoid yield incentives for false disputes).
   - Event: Disputed(id, disputer, amount, reason).

6. **Yield Generation (Passive During Active Phase)**:
   - Contract: On deposit (pledge/vouch), call Aave supply(); track aToken balance.
   - Funds Track: yieldAccrued = aToken.balanceOf(this) - principalTotal. Periodic claimInterest() if needed (CRE cron).
   - No event (queryable via aToken).

7. **Verification/Resolution (CRE Callback)**:
   - CRE consensus at endDate: TRUE → success; FALSE → failure.
   - Contract: verifyAndRelease(success):
     - Success: Withdraw from Aave (principal + yield); release to creator (pledged + bond + yieldShare); vouchers get stake + pro-rata yield.
     - Failure/Fraud: Refunds to pledgers (principal + yieldShare); forfeit creator/voucher bonds to disputers/treasury; return disputer stakes.
     - Dispute upheld: Extra forfeits to disputers.
   - Funds Track: All movements via SafeERC20; treasuryFee = 1% on releases/forfeits.
   - Events: Verified(id, success), FundsReleased(id, amount, to), Refunded(id, pledger, amount), Forfeited(id, from, amount).

8. **Post-Resolution Audit**:
   - Web queries events/logs; contract views for balances/history.
   - Funds Track: All zeroed on resolution; treasury accumulates fees.

### 10.3: Solidity Contract Structures

Extend previous with full mechanics.

```solidity
contract CampaignFactory {
  function createCampaign(...) external returns (address escrow) {
    escrow = new PledgeEscrow(usdc, msg.sender, ...);
    // Track in mapping
  }
}

contract PledgeEscrow {
  // Structs as in previous
  uint256 constant MIN_BOND = 10e6; // $10 USDC
  uint256 constant DISPUTE_THRESHOLD = 10; // 10% of pledged
  uint256 constant TREASURY_FEE = 100; // 1% (basis points)
  IPool public aavePool;

  // Functions as in proposals: pledge, vouch, dispute, verifyAndRelease with yield logic
  function claimYield() internal {
    uint256 yield = IERC20(aavePool.getReserveData(address(usdc)).aTokenAddress).balanceOf(address(this)) - totalPrincipal;
    // Distribute pro-rata
  }
}
```

### 10.4: Integration with CRE and Web Layer

- CRE: Triggers on events (e.g., DisputeTriggered → re-verify); callbacks to verifyAndRelease.
- Web: Wagmi for tx (e.g., pledge call); polling for updates (useInterval on amountPledged); toast on events.

This workflow ensures secure, incentive-aligned financial management.
