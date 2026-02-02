**PledgeBook Product Development Document (Continued)**

## Phase 9: Core Data Schemas – User, Campaign, Pledge & Relational Entities

**Objective**: Define complete, normalized data schemas for the User, Campaign, Pledge, and related entities to support wallet-only authentication, CRE/DECO consensus, staking/bonds, vouchers/disputers, yields, and full lifecycle tracking. These schemas unify frontend (Nuxt), backend (D1 via Workers), and blockchain (Polygon Solidity) layers, ensuring consistency, immutability, and auditability.

**Design Principles**:

- Wallet-only auth: Primary key = Ethereum address (0x...).
- Immutability: Prompt hash, baseline ZK proof, consensus results stored on-chain/IPFS.
- Relational Integrity: Foreign keys, indexes for performance.
- Privacy: Optional `privacyMode` + DECO/ZKP fields.
- Auditability: History log + consensus details.
- Scalability: Normalized tables; JSONB for flexible arrays (tags, history).

### 9.1: User Domain (Wallet-Only Authentication)

**Purpose**: Minimal user record; wallet address is the identity.

**TypeScript / Zod Schema** (packages/shared/src/types/user.ts)

```ts
export const UserSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  createdAt: z.date(),
  lastLoginAt: z.date().nullable(),
  role: z.enum(['user', 'admin', 'verifier']).default('user'),
  preferences: z
    .object({
      privacyMode: z.boolean().default(false),
      notifications: z.boolean().default(true),
    })
    .optional(),
})

export type User = z.infer<typeof UserSchema>
```

**D1 Table**

```sql
CREATE TABLE users (
  address TEXT PRIMARY KEY, -- 0x...
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'verifier')),
  preferences JSONB DEFAULT '{"privacyMode": false, "notifications": true}'
);

CREATE INDEX idx_users_role ON users (role);
```

**Solidity** (optional – mostly off-chain, but reference in contracts)

```solidity
mapping(address => bool) public isAdmin;
```

### 9.2: Campaign Domain (Core Entity)

**Purpose**: Stores all campaign metadata, verification data, and state.

**TypeScript / Zod Schema**

```ts
export const CampaignSchema = z.object({
  campaignId: z.string().uuid(),
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case'),
  purpose: z.string().min(10).max(1000),
  endDate: z.date().refine((d) => d > new Date(), 'Future date'),
  rulesAndResolution: z.string().min(10).max(2000),
  prompt: z.string().min(20).max(5000),
  promptHash: z.string(), // keccak256
  status: z.enum(['draft', 'submitted', 'approved', 'active', 'complete', 'failed', 'disputed']),
  baselineData: z.object({
    valueHash: z.string(),
    zkProof: z.string().optional(), // DECO proof for private data
    proofType: z.enum(['public', 'deco', 'image']).default('public'),
    sources: z.array(z.string()),
  }),
  privacyMode: z.boolean().default(false),
  consensusThreshold: z.number().min(0.5).max(1).default(0.66),
  creatorBond: z.number().nonnegative(), // USDC wei
  amountPledged: z.number().nonnegative().default(0),
  fundraisingGoal: z.number().positive(),
  tags: z.array(z.string()).max(10),
  categories: z.array(z.string()).max(5),
  imageUrl: z.string().url().optional(),
  isShowcased: z.boolean().default(false),
  history: z.array(
    z.object({
      timestamp: z.date(),
      action: z.string(),
      actor: z.string(),
      details: z.string().optional(),
    }),
  ),
  consensusResults: z.array(
    z.object({
      aiProvider: z.string(),
      result: z.boolean(),
      reasoning: z.string(),
      sources: z.array(z.string()),
      timestamp: z.date(),
    }),
  ),
  isDisputed: z.boolean().default(false),
  escrowAddress: z.string().optional(),
})

export type Campaign = z.infer<typeof CampaignSchema>
```

**D1 Table** (main campaigns table)

```sql
CREATE TABLE campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_address TEXT NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  purpose TEXT NOT NULL CHECK (LENGTH(purpose) <= 1000),
  end_date TIMESTAMP NOT NULL,
  rules_and_resolution TEXT NOT NULL CHECK (LENGTH(rules_and_resolution) <= 2000),
  prompt TEXT NOT NULL CHECK (LENGTH(prompt) <= 5000),
  prompt_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  baseline_data JSONB DEFAULT '{}',
  privacy_mode BOOLEAN DEFAULT FALSE,
  consensus_threshold NUMERIC DEFAULT 0.66,
  creator_bond BIGINT DEFAULT 0,
  amount_pledged BIGINT DEFAULT 0,
  fundraising_goal BIGINT NOT NULL,
  tags JSONB DEFAULT '[]',
  categories JSONB DEFAULT '[]',
  image_url TEXT,
  is_showcased BOOLEAN DEFAULT FALSE,
  history JSONB DEFAULT '[]',
  consensus_results JSONB DEFAULT '[]',
  is_disputed BOOLEAN DEFAULT FALSE,
  escrow_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_creator ON campaigns (creator_address);
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_slug ON campaigns (slug);
```

**Solidity Struct** (in PledgeEscrow.sol)

```solidity
struct Campaign {
  uint256 id;
  address creator;
  uint256 endDate;
  bytes32 promptHash;
  string status; // "draft", "active", etc.
  uint256 creatorBond;
  uint256 amountPledged;
  uint256 fundraisingGoal;
  bool privacyMode;
  bool isDisputed;
  address escrowAddress;
  // mappings for pledges/vouchers/disputers
}
```

### 9.3: Pledge Domain

**TypeScript / Zod Schema**

```ts
export const PledgeSchema = z.object({
  pledgeId: z.string().uuid(),
  campaignId: z.string().uuid(),
  pledgerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number().positive(),
  message: z.string().max(280).optional(),
  status: z.enum(['active', 'released', 'refunded']),
  txHash: z.string(),
  pledgedAt: z.date(),
})

export type Pledge = z.infer<typeof PledgeSchema>
```

**D1 Table**

```sql
CREATE TABLE pledges (
  pledge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id),
  pledger_address TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  message TEXT CHECK (LENGTH(message) <= 280),
  status TEXT DEFAULT 'active',
  tx_hash TEXT NOT NULL,
  pledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pledges_campaign ON pledges (campaign_id);
CREATE INDEX idx_pledges_pledger ON pledges (pledger_address);
```

### 9.4: Relational Entities

**Campaign Categories** (Many-to-Many)

```sql
CREATE TABLE campaign_categories (
  campaign_id UUID REFERENCES campaigns(campaign_id),
  category TEXT NOT NULL,
  PRIMARY KEY (campaign_id, category)
);
```

**Vouchers (Endorsers)**

```sql
CREATE TABLE vouchers (
  voucher_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(campaign_id),
  voucher_address TEXT NOT NULL,
  amount BIGINT NOT NULL,
  vouched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);
```

**Disputers**

```sql
CREATE TABLE disputers (
  disputer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(campaign_id),
  disputer_address TEXT NOT NULL,
  amount BIGINT NOT NULL,
  reason TEXT,
  disputed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);
```

**Consensus Results** (JSONB in campaigns table, or separate table for large logs)

### Summary of How Schemas Support the Ecosystem

- **Wallet Auth**: All records keyed by wallet address.
- **Campaign Lifecycle**: Status field drives CRE triggers (baseline → reevaluation).
- **Verification**: baseline_data + consensus_results store DECO/ZKP proofs.
- **Funds Flow**: amountPledged updated on pledge; creator_bond tracked separately.
- **Privacy**: privacyMode + zkProof fields enable anonymous mode.
- **Auditing**: history JSONB + tx_hash for full traceability.

These schemas are normalized, extensible, and ready for Phase implementation.
