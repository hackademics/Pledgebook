# HOWTO — Contracts (Local, Testnet, Mainnet)

This document lists the commands and scripts used to build, test, analyze, and deploy the Pledgebook smart contracts, plus how to test Chainlink CRE workflows.

## Prerequisites

- Install dependencies from the repo root. This bootstraps all workspace packages.

```bash
pnpm install
```

- Create a local environment file for contracts. These define RPCs, private keys, and safety checks.
  - Start from [blockchain/contracts/.env.example](blockchain/contracts/.env.example)
  - Use [blockchain/contracts/.env.testnet.example](blockchain/contracts/.env.testnet.example) for testnet
  - Use [blockchain/contracts/.env.mainnet.example](blockchain/contracts/.env.mainnet.example) for mainnet

- Install Bun for CRE workflow testing (required by the CRE workflow package).

## Build & Clean

Compile contracts and generate artifacts (ABIs, caches).

```bash
pnpm --filter @pledgebook/contracts compile
```

Build is an alias to compile in this package.

```bash
pnpm --filter @pledgebook/contracts build
```

Remove build artifacts and caches to reset the working state.

```bash
pnpm --filter @pledgebook/contracts clean
```

## Tests

Run the full Hardhat unit test suite.

```bash
pnpm --filter @pledgebook/contracts test
```

Generate Solidity coverage reports for the contracts.

```bash
pnpm --filter @pledgebook/contracts coverage
```

## Lint & Format

Lint the contracts package (TypeScript scripts and tooling).

```bash
pnpm --filter @pledgebook/contracts lint
```

Auto-format the contracts package files.

```bash
pnpm --filter @pledgebook/contracts format
```

## Preflight Checks (Safety)

Preflight validates network configuration, addresses, and environment safety before deploy.

```bash
pnpm --filter @pledgebook/contracts preflight:local
```

```bash
pnpm --filter @pledgebook/contracts preflight:amoy
```

```bash
pnpm --filter @pledgebook/contracts preflight:polygon
```

## Deployments

### Local (Hardhat localhost)

Deploys to a local Hardhat node for fast iteration.

```bash
pnpm --filter @pledgebook/contracts deploy:local
```

### Testnet (Polygon Amoy)

Deploys to the Polygon Amoy testnet using testnet RPC and keys.

```bash
pnpm --filter @pledgebook/contracts deploy:amoy
```

### Mainnet (Polygon)

Deploys to Polygon mainnet. Use hardware wallets or least-privileged keys.

```bash
pnpm --filter @pledgebook/contracts deploy:polygon
```

## Security Analysis

Static analysis with Slither (requires Slither installed locally).

```bash
pnpm --filter @pledgebook/contracts analyze:slither
```

Symbolic analysis with Mythril (requires Mythril installed locally).

```bash
pnpm --filter @pledgebook/contracts analyze:mythril
```

## CRE Workflow Tests

CRE workflows live in [blockchain/cre/pledgebook/pledgebook-workflow](blockchain/cre/pledgebook/pledgebook-workflow).

Initialize the CRE workflow environment (this runs on postinstall too).

```bash
cd blockchain/cre/pledgebook/pledgebook-workflow
bunx cre-setup
```

Run the CRE workflow unit tests (validation, baseline, evaluation flows).

```bash
cd blockchain/cre/pledgebook/pledgebook-workflow
bun test
```

## Environment Safety Notes

- Set `EXPECTED_CHAIN_ID` in your environment file to prevent cross-chain mistakes.
- Use `DRY_RUN=true` to validate preflight steps without deploying.
- Prefer hardware wallets or a minimal-funds deployer for mainnet.
