# PledgeBook Product Development Document (Continued)

## Phase 12: CRE Workflows for Consensus and Verification

**Objective**: Define the complete Chainlink Runtime Environment (CRE) workflows for PledgeBook's consensus mechanics, integrating AI models (Claude, Gemini, Grok), API fetches, DECO for privacy-preserving proofs, and ZKPs for anonymous verifiability. This phase coalesces all research on baseline establishment, data collection, evaluation/reevaluation, AI prompting, and integration with smart contracts and the web layer. CRE acts as the trustless orchestrator, automating hands-off verification for diverse goals while ensuring tamper-proof, efficient, and secure processes. Workflows are designed to handle public/private data, enforce SMART criteria, and trigger fund distributions/refunds via callbacks.

Research from 2025-2026 emphasizes CRE's WASM runtime for secure off-chain compute, parallel API/AI calls for consensus, DECO for ZKP-enabled private fetches, and BFT aggregation to mitigate biases. Workflows are stateless, event-triggered, and output attested results for on-chain execution, minimizing gas while supporting global scalability.

**Deliverables**:

- Workflow definitions and TypeScript SDK code.
- Prompt strategies and examples.
- Data handling for baseline/reevaluation.
- Privacy integration with DECO/ZKPs.
- Callback mechanisms to contracts.
- Schema updates for workflow inputs/outputs.

**Standards, Patterns, Conventions, and Best Practices** (Carmack-Inspired):

- **Modular Workflows**: Separate triggers (time/event-based), steps (fetch, AI, aggregate), and callbacks for reusability. Carmack: "Break workflows into testable units; simulate end-to-end early."
- **Dynamic Prompting**: Interpolated placeholders for campaign-specific data; hashed for immutability.
- **Consensus Aggregation**: Parallel ComputeSteps for AIs; BFT threshold (≥2/3 TRUE) via consensusMedianAggregation.
- **Data Sourcing**: Prioritize public APIs; DECO for private (ZKPs prove deltas without values).
- **Privacy by Default**: DECO confidential compute for sensitive fetches; ZKPs for anonymous mode outputs.
- **Tamper-Proofing**: Hash all inputs/outputs; CRE signatures on callbacks.
- **Efficiency**: Parallel calls; off-chain for AI (low latency <5s); gas-optimized callbacks (single value returns).
- **Error Handling**: Retry on API failures (CRE built-in); fallback to admin if undetermined.
- **Secrets**: CRE's usingSecretsDeployed for AI/API keys; no exposure.
- **Testing Gate**: CRE simulation mode for local tests; Vitest mocks AI responses; Hardhat integration tests for callbacks. Junior task: Simulate a full workflow for "weight loss" goal.

### 12.1: CRE Workflow Definitions

CRE workflows are defined in TypeScript (packages/cre-workflows/src/), deployed to a subscription, and triggered by events/time. Three main workflows cover the lifecycle:

1. **ValidationWorkflow**: Pre-approval draft check.
2. **BaselineWorkflow**: Initial data capture.
3. **EvaluationWorkflow**: End-date consensus.

**TypeScript Schema for Workflow Inputs/Outputs** (packages/shared/src/types/cre.ts)

```ts
export const VerificationInput = z.object({
  campaignId: z.string(),
  prompt: z.string(),
  promptHash: z.string(),
  goal: z.string(),
  endDate: z.date(),
  sources: z.array(
    z.object({
      type: z.enum(['public_api', 'private_api', 'image']),
      endpoint: z.string(),
      keyHash: z.string().optional(), // For private
      ipfsHash: z.string().optional(), // For images
    }),
  ),
  privacyMode: z.boolean(),
  baselineData: z.object({ valueHash: z.string(), zkProof: z.string().optional() }).optional(), // For reevaluation
})

export type VerificationInput = z.infer<typeof VerificationInput>

export const VerificationOutput = z.object({
  accepted: z.boolean().optional(), // For validation
  valid: z.boolean().optional(), // For baseline
  success: z.boolean().optional(), // For evaluation
  reasons: z.array(z.string()),
  suggestions: z.array(z.string()).optional(),
  refinedPrompt: z.string().optional(),
  baselineValueHash: z.string().optional(),
  zkProof: z.string().optional(),
  consensusDetails: z
    .array(
      z.object({
        aiProvider: z.string(),
        result: z.boolean(),
        reasoning: z.string(),
        sourcesCited: z.array(z.string()),
        integrityCheck: z.boolean(),
      }),
    )
    .optional(),
  timestamp: z.date(),
})

export type VerificationOutput = z.infer<typeof VerificationOutput>
```

### 12.2: Prompt Strategies (From Phase 6.8)

Prompts are stored/hashed in Campaign; dynamic with placeholders. Run in CRE ComputeSteps.

- **Validation Prompt**: Rejects non-SMART goals; suggests refinements.
- **Baseline Prompt**: Extracts/validates initial data; generates ZKP if private.
- **Evaluation Prompt**: Compares baseline to current; determines TRUE/FALSE.

**Immutability/Auditing**: Prompt text + hash on-chain/IPFS; CRE logs inputs/outputs with signatures; web UI displays prompt for manual re-run.

### 12.3: Data Collection and Storage Processes

- **Public APIs**: CRE HttpStep fetches (e.g., FBI UCR); store value/hash on-chain.
- **Private APIs**: DECO proves value without key exposure; store ZKP.
- **Images**: Upload to IPFS; CRE AI OCR step extracts; store hash/ZKP.
- **Storage Integration**: D1 for metadata; IPFS for raw (encrypted if private); on-chain for hashes/ZKPs.

### 12.4: Evaluation and Reevaluation Processes

- **Baseline (Approval Trigger)**: CRE event-based; fetches data, validates, stores proof.
- **Reevaluation (End Date Trigger)**: CRE time-based; fetches current, compares via AI prompts, aggregates consensus, callbacks contract.
- **Edge Cases**: If data unavailable, fallback to FALSE + manual dispute; AI integrity checks (e.g., timestamp match).

### 12.5: Privacy Integration with DECO/ZKPs

- DECO in CRE steps for private fetches (TLS APIs with user keys from secrets).
- ZKPs generated for deltas (e.g., circom circuits for "increase ≥10%"); output to AI as hash/proof.
- Anonymous Mode: Prompts use "Evaluate ZKP [hash]" instead of values.

#### 12.5.1: Circom Circuit Catalog + ZKP Pipeline

**Circuit Naming (v1):**

- `delta_increase_gte`: Proves $(current - baseline) \ge threshold$.
- `delta_decrease_gte`: Proves $(baseline - current) \ge threshold$.
- `ratio_increase_gte`: Proves $\frac{current}{baseline} \ge threshold$.
- `within_range`: Proves $min \le current \le max$.

**Public Inputs (all circuits):**

- `baselineHash`, `currentHash`, `thresholdHash` (Poseidon hash commitments)
- `campaignIdHash`, `promptHash`

**Private Inputs (all circuits):**

- `baselineValue`, `currentValue`, `thresholdValue`
- `nonce` (per-proof salt)

**Outputs:**

- `proof` (Groth16)
- `publicSignals` (hashes + boolean flag)

**Pipeline:**

1. CRE fetches private data via DECO; compute hashes in WASM.
2. Circom witness is built in a ComputeStep; proof generated off-chain (trusted setup artifacts stored in IPFS).
3. CRE stores `proofHash`, `publicSignalsHash`, and `vkHash` on-chain/D1.
4. Evaluation prompts reference hashes only when `privacyMode=true`.
5. On-chain verification uses `vkHash` to select the correct verification key; emits `VerifiedZKP` on success.

**Auditability:**

- Each proof is bound to `campaignIdHash` + `promptHash` to prevent replay.
- Store `vkHash` in Campaign to lock circuit version per campaign lifecycle.

### 12.6: Callback Mechanisms to Contracts

- CRE EVMClient.write to `verifyAndRelease(success, promptHash, consensusDetails)`; restricted to creOracle address.
- Contract emits Verified; web polls or subscribes to events for UI updates.

### 12.7: Schema Updates for Workflows

Extend Campaign schema with:

```json
{
  "validationResult": "object { accepted: boolean, reasons: array<string>, suggestions: array<string>, refinedPrompt: string }",
  "baselineResult": "object { baselineValueHash: string, zkProof: string, reasoning: string, valid: boolean }",
  "evaluationResult": "object { success: boolean, reasoning: string, consensusDetails: array<object> }"
}
```

**D1 Extensions**:

```sql
ALTER TABLE campaigns ADD COLUMN validation_result JSONB DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN baseline_result JSONB DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN evaluation_result JSONB DEFAULT '{}';
```

**Solidity Update**:

```solidity
struct Campaign {
  // ... existing
  bytes32 validationHash;
  bytes32 baselineHash;
  bytes32 evaluationHash;
}
```

### 12.8: Full CRE Workflow Code Example (pledgeVerification.ts)

```ts
import { Workflow, Trigger, HttpStep, ComputeStep } from '@chainlink/cre-sdk-typescript'

const workflow = new Workflow({
  name: 'PledgeVerification',
})

// Trigger
workflow.addTrigger(new Trigger.TimeBased({ timestamp: inputs.endDate }))

// Step 1: Fetch current data with DECO if private
workflow.addStep(
  new ComputeStep({
    compute: async (inputs) => {
      // Logic as in 6.3 example
    },
  }),
)

// Step 2: AI consensus
workflow.addStep(
  new ComputeStep({
    compute: async (inputs) => {
      // Logic as in 6.3
    },
  }),
)

// Callback
workflow.addCallback('verifyAndRelease', {
  contractAddress: inputs.escrowAddress,
  params: [inputs.campaignId, success, inputs.promptHash],
})

export default workflow
```

**Validation Gate for Phase 6**:

- Simulate workflows locally (CRE SDK simulation).
- Test with 3 goal examples (weight loss, sales, crime); ensure ZKP outputs parse.
- Junior Task: Add a new source type to the workflow (e.g., manual upload).
