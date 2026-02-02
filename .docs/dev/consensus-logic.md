# PledgeBook Product Development Document (Continued)

## Phase 6: Consensus Mechanics Using CRE and DECO

**Objective**: Define the consensus determination system for verifying campaign outcomes, integrating Chainlink Runtime Environment (CRE) with AI models (Claude, Gemini, Grok) and API sources for automated, private, and verifiable evaluations. This phase coalesces all research on baseline establishment, data collection/storage, evaluation/reevaluation, and integration with the campaign lifecycle. The system ensures "truth > trust" by handling public/private data securely, using zero-knowledge proofs (ZKPs) via DECO for privacy, and multi-AI aggregation for robustness. It supports diverse verifiable goals (e.g., weight loss, sales increases, crime reduction) while rejecting vague ones, enabling hands-off automation for fund distribution or refunds.

Research from 2025-2026 Chainlink updates emphasizes CRE's trigger-and-callback model for workflows, parallel API calls, BFT consensus, and confidential compute. DECO (now integrated into CRE for privacy-preserving fetches) uses ZKPs to prove facts about private data without exposure. Examples from AI-powered prediction markets (e.g., using Gemini in CRE workflows) show parallel AI calls for consensus, applied here to goal verification.

**Deliverables**:

- Detailed consensus workflow steps with code snippets.
- Data collection/storage/evaluation processes.
- Privacy handling with DECO/ZKPs.
- Updated campaign schema to support consensus.
- CRE workflow schema and TypeScript examples.
- Integration with funds release/refund.

**Standards, Patterns, Conventions, and Best Practices**:

- **Objectivity Enforcement**: Goals must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound); AI pre-check rejects vagueness during creation.
- **Data Sourcing**: Prioritize public APIs for neutrality; DECO for private; IPFS for user uploads.
- **Consensus Threshold**: ≥2/3 TRUE from AI models; tie → fallback to extended sources or admin.
- **Privacy by Default**: Anonymous mode uses ZKPs to prove deltas without values; full DECO for sensitive fetches.
- **Tamper-Proofing**: Hashes for all data/prompts; CRE's BFT consensus on outputs.
- **Carmack Rules**: Keep workflows modular (separate steps for fetch/AI/aggregate); simulate locally first; error-handle API failures (retry/fallback).
- **Efficiency**: Parallel AI calls in CRE ComputeStep; off-chain for heavy compute.
- **Testing Gate**: Vitest mocks for AI responses; Hardhat forks for end-to-end (baseline → reevaluation → callback).

### 6.1: Data Collection and Storage

Data is collected at baseline (campaign start) and stored immutably for reevaluation. Public data uses direct APIs; private/edge cases use DECO + user credentials.

- **Collection Process**:
  - **Public Data** (e.g., crime stats): CRE HttpStep fetches from whitelisted APIs (e.g., FBI UCR).
  - **Private Data** (e.g., weight, grades): User provides endpoint/key (e.g., Fitbit token) during creation; DECO proves value without exposure.
  - **Image/OCR Data** (e.g., scale photo, report scan): User uploads to IPFS (encrypted); CRE uses AI vision (e.g., Gemini) for extraction.
  - **Edge Cases** (e.g., "complete marathon"): Combine API (Strava GPS) + image (bib photo); DECO proves "distance >= 26.2 miles" without full track.

- **Storage**:
  - Baseline value/hash on-chain (contract struct).
  - Raw private data: Never stored; only ZKP/hash.
  - Public evidence: IPFS hash on-chain/D1.
  - D1 for metadata (e.g., sources array).

**Example for "Lose 50 lbs. by end date"**:

- Baseline: User inputs starting weight (300 lbs.) + proof (encrypted Fitbit API call or photo). CRE/DECO fetches/proves "weight = X" → stores ZKP/hash.
- Storage: On-chain { baselineHash: '0x...', proofType: 'DECO_ZKP' }.

### 6.2: Evaluation and Reevaluation During Campaign Lifecycle

- **Baseline Evaluation** (Campaign Approval): CRE mini-workflow establishes "before" state, validates verifiability.
- **Reevaluation** (End Date): CRE full workflow fetches "after" state, compares, runs AI consensus.
- **Lifecycle Integration**: Status updates trigger workflows (e.g., Approved → baseline; Active → monitoring; Complete → distribution).

**Process Flow**:

1. Fetch baseline/current via API/DECO.
2. Construct prompt with proofs (not raw data).
3. AI evaluation + consensus.
4. Callback with verifiable result.

**Example for "Increase sales by 10% for 2026"**:

- Baseline: DECO proves Q4 2025 sales from private ERP API → ZKP "sales = $100K".
- Reevaluation: DECO proves 2026 sales → ZKP "sales = $110K" → prompt "Baseline $100K proof [hash]; current $110K proof [hash] — TRUE if increase ≥10%."

### 6.3: Privacy and Verifiability with DECO/ZKPs

- DECO fetches private data (TLS APIs) and generates ZKPs (e.g., "prove GPA > baseline + 0.5 without values").
- Anonymous Mode: Only delta proved publicly (e.g., "weight loss ≥50 lbs.").
- Integration: CRE ComputeStep calls DECO client; output ZKP fed to AI prompt.

**Code Example (CRE Workflow Step)**:

```ts
workflow.addStep(
  new ComputeStep({
    compute: async (inputs) => {
      const deco = runtime.clients.deco
      const baselineProof = await deco.prove(
        inputs.privateEndpoint,
        inputs.keySecret,
        'extract_weight',
      )
      const currentProof = await deco.prove(
        inputs.privateEndpoint,
        inputs.keySecret,
        'extract_weight',
      )
      const deltaProof = await deco.generateZkp('weight_delta >= 50', [baselineProof, currentProof])
      return { deltaProof }
    },
  }),
)
```

### 6.4: Updated Campaign Schema for Consensus

Extend Phase 1 schema with consensus-specific fields.

```json
{
  // ... Phase 1 fields
  "baselineData": "object { valueHash: string, proofType: string (e.g., 'DECO_ZKP'), sources: array<string> }",
  "privacyMode": "boolean (default false; enables anonymous ZKPs)",
  "consensusThreshold": "number (default 0.66; ≥2/3)",
  "verificationSources": "array<object { type: enum('API', 'IMAGE', 'MANUAL'), endpoint: string, keyHash: string (for private) }>"
}
```

**D1 Table Addition**:

```sql
ALTER TABLE campaigns ADD COLUMN baseline_data JSONB DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN privacy_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE campaigns ADD COLUMN consensus_threshold NUMERIC DEFAULT 0.66;
ALTER TABLE campaigns ADD COLUMN verification_sources JSONB DEFAULT '[]';
```

**Solidity Update**:

```solidity
struct Campaign {
  // ... existing
  bytes32 baselineHash;
  bool privacyMode;
  uint8 consensusThreshold; // Scaled, e.g., 66 for 66%
  string[] verificationSources;
}
```

**TypeScript/Zod Update**:

```ts
CampaignSchema = CampaignSchema.extend({
  baselineData: z.object({
    valueHash: z.string(),
    proofType: z.string(),
    sources: z.array(z.string()),
  }),
  privacyMode: z.boolean(),
  consensusThreshold: z.number().min(0.5).max(1),
  verificationSources: z.array(
    z.object({
      type: z.enum(['API', 'IMAGE', 'MANUAL']),
      endpoint: z.string(),
      keyHash: z.string().optional(),
    }),
  ),
})
```

### 6.5: CRE Workflow Schema and TypeScript Examples

CRE workflow for verification (extend Phase 4).

**Input Schema**:

```ts
export interface VerificationInput {
  campaignId: string
  prompt: string
  promptHash: string
  baselineData: { valueHash: string; proofType: string; sources: string[] }
  verificationSources: { type: string; endpoint: string; keyHash?: string }[]
  privacyMode: boolean
  endDate: number
}
```

**Output Schema**:

```ts
export interface VerificationOutput {
  success: boolean
  reasoning: string
  consensusDetails: { aiProvider: string; result: boolean; reasoning: string; sources: string[] }[]
  zkProof?: string // For privacy mode
  timestamp: number
}
```

**Full Workflow Example** (pledgeVerification.ts):

```ts
import { Workflow, Trigger, HttpStep, ComputeStep } from '@chainlink/cre-sdk-typescript'

const workflow = new Workflow({
  name: 'PledgeVerification',
})

// Trigger: End date
workflow.addTrigger(new Trigger.TimeBased({ timestamp: inputs.endDate }))

// Step 1: Fetch baseline/current with DECO if private
workflow.addStep(
  new ComputeStep({
    compute: async (inputs) => {
      const deco = runtime.clients.deco
      const fetches = inputs.verificationSources.map(async (source) => {
        if (source.type === 'API' && inputs.privacyMode) {
          return await deco.prove(
            source.endpoint,
            source.keyHash ? secrets[source.keyHash] : null,
            'extract_value',
          )
        } else if (source.type === 'IMAGE') {
          // AI OCR
          const ocr = await callGeminiVision(source.endpoint) // IPFS URL
          return { value: ocr.extracted, proof: ocr.zkProof }
        } else {
          // Public HTTP
          return await runtime.clients.http.get(source.endpoint)
        }
      })
      const currentData = await Promise.all(fetches)
      return { currentData }
    },
  }),
)

// Step 2: AI consensus with proofs
workflow.addStep(
  new ComputeStep({
    compute: async (inputs) => {
      const prompt = `${inputs.prompt}\nBaseline: ${inputs.baselineData.valueHash}\nCurrent: ${inputs.currentData.map((d) => d.proof || d.value).join(', ')}`
      const aiResults = await Promise.all([
        callClaude(prompt),
        callGemini(prompt),
        callGrok(prompt),
      ])
      const trues = aiResults.filter((r) => r.result).length
      const success = trues >= 2
      return {
        success,
        consensusDetails: aiResults,
        zkProof: inputs.privacyMode ? generateZkp(success, inputs) : null,
      }
    },
  }),
)

// Callback to contract
workflow.addCallback('verifyAndRelease', {
  contractAddress: inputs.escrowAddress,
  params: [inputs.campaignId, success, inputs.promptHash],
})

export default workflow
```

### 6.6: Examples for Goal Types

- **Individual Weight Loss**: Baseline DECO proof "weight = X"; reevaluation image OCR + ZKP "decrease ≥50 lbs."
- **Corporate Sales Increase**: Baseline private API DECO "sales = Y"; reevaluation "increase ≥10%."
- **Political Crime Reduction**: Public API baseline/reevaluation; consensus on stats.
- **Non-Profit Shelter Provision**: Image/GPS proofs OCR'd for "10 individuals sheltered."
- **Educational Truancy Reduction**: Private school API DECO for rates.

This system ensures verifiable consensus while protecting privacy.
