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
