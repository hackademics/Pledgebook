# CRE Guide (PledgeBook)

This guide summarizes the Chainlink Runtime Environment (CRE) TypeScript SDK and operational conventions relevant to PledgeBook workflows. It is based on the official CRE documentation (January 2026).

## Version Alignment

- Required CRE SDK version: v1.0.7
- Required CRE CLI version: v1.0.7
- Runtime requirements: Bun >= 1.2.21, TypeScript >= 5.9
- SDK package: `@chainlink/cre-sdk`

## Runtime Model (WASM + QuickJS)

- Workflows compile to WASM using Javy + QuickJS.
- QuickJS is not Node.js; Node built-ins like `node:crypto` are not available.
- Use `runtime.log()` for logging. `console.log` does not output in WASM.
- Validate third-party libraries with `cre workflow simulate` before production use.
- Avoid dynamic `require()`/`import()`; bundle all deps.
- Keep execution short; long network calls should use capability timeouts.

## Core Workflow Structure

### Required entry points

- `main()` creates a runner and calls `runner.run(initWorkflow)`.
- `initWorkflow(config)` returns an array of `handler()` entries.

### `handler()` pattern

Connects a trigger instance to a callback that contains the workflow logic.

### `.result()` pattern (critical)

All SDK capability calls are synchronous and use a two-step pattern:

1. initiate capability call
2. call `.result()` to block for response

Example usage patterns:

- HTTP: `httpClient.sendRequest(...).result()`
- EVM reads: `evmClient.callContract(...).result()`
- EVM writes: `evmClient.writeReport(...).result()`
- Secrets: `runtime.getSecret(...).result()`
- Node mode: `runtime.runInNodeMode(... )().result()`

### Reports & callbacks

- Use `prepareReportRequest()` to build report payloads.
- Submit with `runtime.report(reportRequest).result()` for DON-signed reports.
- For EVM writes, prefer `evmClient.writeReport(...).result()` with report data.

### `Runtime` vs `NodeRuntime`

- `Runtime` is DON-level and BFT-safe for final results.
- `NodeRuntime` is per-node; use inside `runtime.runInNodeMode()` with explicit consensus aggregation.

## Triggers

Supported triggers:

- Cron (time-based)
- HTTP (webhook)
- EVM Log (on-chain event)

Each trigger requires a matching callback signature.

### Trigger conventions

- HTTP triggers should return fast, small responses; do heavy work off the request path.
- EVM Log triggers should filter tightly by address and topics to minimize load.

## HTTP Client

- Use high-level `HTTPClient.sendRequest(runtime, fn, aggregation)` where possible. It automatically wraps node mode + consensus aggregation.
- `sendRequester.sendRequest()` returns a response with a `.result()`.
- Helper utilities: `ok()`, `text()`, `json()`, `getHeader()`.

### HTTP limits

- Redirects are not supported. Use final destination URLs.
- Default timeout: 5s. Max timeout: 10s.

### Cache settings (important for non-idempotent requests)

Use `cacheSettings` for POST/PUT/PATCH/DELETE to reduce duplicates across nodes:

- `readFromCache: true`
- `maxAgeMs`: set to duration slightly longer than workflow execution time (e.g., 60000 ms)

## Consensus & Aggregation

Use with `runtime.runInNodeMode()` or high-level `HTTPClient.sendRequest`:

- `consensusMedianAggregation<T>()` for numeric/Date results
- `consensusIdenticalAggregation<T>()` for exact match across nodes
- `ConsensusAggregationByFields<T>()` for objects
- Optional defaults via `.withDefault(value)`

### Consensus guardrails

- Apply BFT thresholds (e.g., ≥2/3) for boolean outcomes.
- Keep AI calls in node mode and aggregate on DON for final decision.

## EVM Client

### Network selection

- Use `getNetwork({ chainFamily: "evm", chainSelectorName, isTestnet })`.
- `getNetwork()` returns chain selector metadata; pass `network.chainSelector.selector` to `new EVMClient(...)`.

### Reads

- `callContract()` with `encodeCallMsg()`
- `filterLogs()`, `balanceAt()`, `estimateGas()`, `getTransactionByHash()`, `getTransactionReceipt()`, `headerByNumber()`
- Use `LATEST_BLOCK_NUMBER` or `LAST_FINALIZED_BLOCK_NUMBER` for block references

### Writes

- `writeReport()` submits signed reports on-chain
- Recommended: `prepareReportRequest()` to build report request for `runtime.report()`

### Utilities

- `encodeCallMsg()`, `bytesToHex()`, `hexToBase64()`, `blockNumber()`, `protoBigIntToBigint()`

### Chain selectors (Polygon)

- Polygon Amoy: `polygon-testnet-amoy`
- Polygon Mainnet: `polygon-mainnet`

## Secrets

- Use `runtime.getSecret()` in workflow callbacks.
- Secrets are stored in the Vault DON and referenced via `secrets.yaml` names.
- Never hardcode secrets in configs or workflow code.

### Secrets workflow

- Deploy secrets before workflow activation; reference names via `usingSecretsDeployed` in workflow config.
- Rotate secrets by redeploying and reactivating workflows.

## Logging and Error Handling

- Use `runtime.log()` inside callbacks.
- For `main()` errors, use `sendErrorResponse(error)` if custom handling is added.

### Error handling patterns

- Wrap external calls in try/catch; return structured failure objects to keep aggregations stable.
- Prefer explicit `ok()` checks for HTTP responses before `json()` parsing.

## CLI Workflow (Typical)

1. `cre init`
2. `cre workflow simulate`
3. `cre workflow deploy`
4. `cre workflow activate` / `cre workflow pause`

### Lifecycle commands

- `cre workflow delete` removes deployed workflows.
- `cre workflow list` shows deployments by subscription.
- Use `cre workflow info` to validate activation + version hash.

## PledgeBook-Specific Guidance

- Prefer `ConsensusAggregationByFields` for AI consensus objects.
- Use node-level HTTP for external API fetches and DON-level EVM writes.
- Ensure workflow config includes chain selector names (string), not numeric IDs.
- For any non-idempotent offchain POSTs, enable HTTP caching.
- Validate QuickJS compatibility for any ZKP, AI, or cryptographic libraries.

### ZKP/DECO integration (PledgeBook)

- Keep private values off the prompt; expose only hashes + ZKP metadata.
- Bind proofs to `campaignId` and `promptHash` to prevent replay.
- Store `vkHash` per campaign to lock circuit versions for audits.

### DECO workflow model (from DECO Sandbox)

- **Prover/Verifier split**: The DECO Prover runs with the data holder (e.g., institution) and fetches sensitive data; Chainlink oracles run the DECO Verifier.
- **Proof of provenance**: Proofs attest that data came from a trusted HTTPS source (TLS) without revealing the underlying data.
- **Attestation output**: Oracles verify proofs and submit a time-stamped attestation onchain for smart contracts to consume.
- **No data-source changes**: DECO works with existing APIs and legacy systems without requiring modifications.

### DECO Sandbox capabilities

- Configure **HTTPS requests** used in proofs.
- Define **zero-knowledge assertions** over request/response data.
- Use **selective disclosure** to reveal non-sensitive fields only.
- Create **public field assertions** from authenticated responses.
- Use **templates** for portable configs.
- Download attestations or post them to a testnet for end-to-end testing.

## Source References

- CRE SDK Overview (TypeScript): https://docs.chain.link/cre/reference/sdk/overview-ts
- Core SDK: https://docs.chain.link/cre/reference/sdk/core-ts
- Triggers: https://docs.chain.link/cre/reference/sdk/triggers/overview-ts
- HTTP Client: https://docs.chain.link/cre/reference/sdk/http-client-ts
- EVM Client: https://docs.chain.link/cre/reference/sdk/evm-client-ts
- Consensus: https://docs.chain.link/cre/reference/sdk/consensus-ts
- TypeScript WASM Runtime: https://docs.chain.link/cre/concepts/typescript-wasm-runtime
- CLI Reference: https://docs.chain.link/cre/reference/cli
