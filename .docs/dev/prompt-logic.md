### Refined Prompting Strategy for Consensus AI Calls and Campaign Validation

**Objective**: To create a secure, robust, and verifiable prompting system for PledgeBook's AI-driven consensus, ensuring that campaigns are objectively evaluated, baselines are accurately established, and outcomes are determined with high confidence. This strategy minimizes fraud, enforces SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals, handles diverse data types (public APIs, private DECO/ZKPs, images), and provides standardized, auditable responses from AI models. Prompts are designed to be dynamic yet tamper-proof, integrated with CRE workflows for automation, and stored immutably to build trust among creators and donors.

**Deliverables**:

- Recommended number of prompts (3 core types).
- Detailed style, purpose, and examples for each.
- Storage and auditing mechanisms.
- Integration with CRE workflows and data schemas.

**Standards, Patterns, Conventions, and Best Practices**:

- **Prompt Design**: Modular, context-rich, and standardized output format (e.g., JSON with TRUE/FALSE, reasoning, sources) to enable easy aggregation in CRE. Use few-shot examples for consistency; avoid ambiguity. Carmack-inspired: Keep prompts simple and testable; iterate with mock data.
- **Dynamic Adaptation**: Prompts interpolate campaign-specific data (goals, sources) without allowing runtime changes.
- **Consensus Handling**: Each AI call uses the same prompt; CRE aggregates with threshold (≥2/3 TRUE).
- **Privacy**: Use DECO/ZKPs in prompts (e.g., "Evaluate proof hash" instead of raw data).
- **Error/Fraud Prevention**: Prompts include tamper-checks (e.g., "Verify data integrity per hash"); reject if unverifiable.
- **Testing Gate**: Vitest mocks for prompt outputs; ensure 100% parse success. Junior task: Test prompt with 10 varied goals.

### 6.7: Recommended Number of Prompts

Based on the need for campaign filtering, baseline setup, and outcome verification, use **3 core prompts**:

1. **Validation Prompt**: For accepting/rejecting drafts (pre-approval).
2. **Baseline Prompt**: For establishing and verifying initial data (at approval).
3. **Evaluation Prompt**: For reevaluating at end date and determining consensus.

This minimizes complexity while covering the lifecycle. No more are needed, as the evaluation prompt can handle reevaluation dynamically. All prompts are hashed and stored immutably (see Storage section).

### 6.8: Style and Purpose of Each Prompt

Prompts are structured as follows:

- **Style**: Instructional, zero-shot or few-shot with examples; explicit output format (JSON for parseability); include fraud/tamper checks; dynamic placeholders (e.g., ${goal}, ${sources}). Length: 200–500 tokens for efficiency.
- **Purpose**: Ensure objectivity, verifiability, and standardization; guide users toward SMART goals.

**1. Validation Prompt (For Campaign Acceptance/Rejection)**

- **Purpose**: Run during draft submission to evaluate if the goal is verifiable, SMART-compliant, and fraud-resistant. Rejects vague/platitudinous goals (e.g., "make the world better"); suggests improvements if borderline. This nips poor campaigns early, saving resources and enhancing platform quality. If accepted, auto-generates/refines the evaluation prompt.
- **Style**: Analytical, with rubric for SMART scoring; output includes acceptance (TRUE/FALSE), reasons, and suggestions.
- **Example Prompt** (Used in CRE mini-workflow on submit):

  ```
  You are a strict campaign validator for PledgeBook, a platform for verifiable, outcome-based fundraising. Evaluate if this campaign draft is acceptable. It must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound. Reject vague goals like "make the world better"; require quantifiable metrics with reliable sources (APIs, verifiable evidence). Check for fraud risks (e.g., unprovable claims).

  Campaign Data:
  - Goal: ${goal}
  - Description: ${description}
  - End Date: ${endDate}
  - Rules/Sources: ${rulesAndSources}
  - Tags/Categories: ${tags}

  Output exactly this JSON format:
  {
    "accepted": boolean,
    "reasons": array<string> (3–5 bullet points explaining decision),
    "suggestions": array<string> (improvements if rejected or borderline, e.g., "Add API source like FBI UCR"),
    "refinedPrompt": string (suggested evaluation prompt if accepted, e.g., "Compare baseline X to current Y from Z source; TRUE if Y >= X + 10%")
  }
  ```

- **Example Usage**: For "Lose 50 lbs. by end date" with Fitbit source → Accepted, refinedPrompt: "Baseline weight X from Fitbit API; current Y; TRUE if Y <= X - 50."  
  For "Make world better" → Rejected, suggestions: "Specify measurable metric like 'Plant 100 trees per verified GPS data'."

**2. Baseline Prompt (For Initial Data Establishment)**

- **Purpose**: Run at approval to capture/verify baseline data, ensuring it's from reliable sources and tamper-proof. Stores hashed/proven values for later comparison, handling public/private data. This sets the "before" state for all goals.
- **Style**: Extractive and proof-generating; includes integrity checks (e.g., timestamp match). Output standardized proof (value/hash/ZKP).
- **Example Prompt** (In CRE workflow with DECO if private):

  ```
  You are a baseline data verifier for PledgeBook. Extract and validate the initial value from the provided sources. Ensure data is current, from reliable origins, and tamper-free (check timestamps/metadata). For private data, generate ZKP proof.

  Campaign Goal: ${goal}
  Sources: ${sources} (e.g., API endpoint or IPFS image)
  Privacy Mode: ${privacyMode}

  Output exactly this JSON format:
  {
    "baselineValue": string/number (extracted value, e.g., "300 lbs"),
    "valueHash": string (keccak256 hash for immutability),
    "zkProof": string (DECO-generated proof if privacyMode true, e.g., "weight = X"),
    "reasoning": string (how data was validated, cited sources),
    "valid": boolean (TRUE if verifiable; FALSE if issues like outdated data)
  }
  ```

- **Example Usage**: For "Reduce truancy by 10%": Fetch school API baseline rate (20%); output valueHash, ZKP "rate = Y%" if private.

**3. Evaluation Prompt (For End-Date Reevaluation and Consensus)**

- **Purpose**: The main consensus driver; compares baseline to current data at end date, determining TRUE/FALSE for fund release/refund. Dynamic to handle diverse goals; uses proofs for privacy. Aggregated across AIs in CRE.
- **Style**: Comparative, evidence-based; strict output format for aggregation. Includes fraud checks (e.g., data consistency).
- **Example Prompt** (Run per AI in CRE parallel step):

  ```
  You are an impartial outcome verifier for PledgeBook. Compare baseline to current data against the goal. Use only provided sources; check for tampering (hashes/metadata). For privacy mode, evaluate proofs without raw values.

  Goal: ${goal} (e.g., "Lose 50 lbs.")
  Baseline: ${baseline.valueHash or zkProof}
  Current Data: ${current.valueHash or zkProof}
  Sources: ${sources}
  Privacy Mode: ${privacyMode}
  End Date: ${endDate}

  Output exactly this JSON format:
  {
    "result": boolean (TRUE if goal achieved; FALSE otherwise),
    "reasoning": string (step-by-step explanation, e.g., "Baseline hash matches 300 lbs; current proof shows 250 lbs; decrease = 50 lbs ≥ goal"),
    "sourcesCited": array<string> (exact sources used),
    "integrityCheck": boolean (TRUE if data untampered)
  }
  ```

- **Example Usage**: For "Increase student grades by 20%": Baseline ZKP "average GPA = 2.5"; current "GPA = 3.0" — TRUE if increase ≥20%.

### 6.9: Storage and Auditing of Prompts

- **Storage**: Prompts hashed (keccak256) and stored on-chain in Campaign struct + IPFS for full text. CRE workflows reference hash to prevent changes.
- **Auditing**: Publicly viewable via explorer/UI (campaign detail page shows prompt text + hash). CRE logs all executions with input hashes; disputes trigger re-run with same prompt for verification. No edits post-approval (contract revert if hash mismatch).
- **Confidence Building**: UI shows "Prompt Hash Verified" badge; donors can copy prompt + data to re-run manually in AI tools.

**Updated Campaign Schema Additions**:

```json
{
  "validationPromptResult": "object { accepted: boolean, reasons: array<string>, suggestions: array<string>, refinedPrompt: string }",
  "baselinePromptResult": "object { baselineValue: string, valueHash: string, zkProof: string, reasoning: string, valid: boolean }",
  "evaluationPrompt": "string (immutable refined prompt for reevaluation)"
}
```
