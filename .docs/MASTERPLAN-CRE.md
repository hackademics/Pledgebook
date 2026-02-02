# MASTERPLAN — Chainlink CRE Workflows

## Workflows

1. `ValidationWorkflow`
2. `BaselineWorkflow`
3. `EvaluationWorkflow`

---

## Folder Layout

- packages/cre-workflows/
  - workflows/
  - prompts/
  - utils/

---

## Input/Output Contracts

### Input (Shared)

- `campaignId: string`
- `prompt: string`
- `promptHash: string`
- `goal: string`
- `endDate: number`
- `sources: { type, endpoint, keyHash?, ipfsHash? }[]`
- `privacyMode: boolean`
- `baselineData?`

### Output (Shared)

- `accepted?` / `valid?` / `success?`
- `reasons: string[]`
- `consensusDetails?`
- `baselineValueHash?`
- `zkProof?`
- `timestamp: number`

---

## Prompt Files

- `validation.prompt.ts`
- `baseline.prompt.ts`
- `evaluation.prompt.ts`

All prompts must be immutable and hashed (keccak256).

---

## Functions & Utilities

### `hashPrompt(prompt: string): string`

- returns keccak256 hash for immutability.

### `callAI(provider, prompt)`

- Standardized JSON output parse.

### `aggregateConsensus(results)`

- BFT threshold: 2/3 TRUE.

---

## Privacy/DECO Integration

- DECO for private API fetches.
- ZKP generation in `BaselineWorkflow` if `privacyMode`.
- Evaluation uses hashes, not raw data.

---

## Tests

- Mock AI responses in Vitest.
- Simulate workflow for 3 goal types.
- Ensure JSON schema validation passes 100%.

---

## CRE Deployment Checklist

- Configure secrets (AI keys, API keys).
- Register workflow triggers.
- Verify callback addresses match `creOracle`.
