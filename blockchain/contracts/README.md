# PledgeBook Contracts (Hardhat)

Security-first Hardhat setup for Solidity development, testing, and deployment.

## Quick start

1. Copy environment template and fill secrets:
   - Create a local `.env` from `.env.example`.
   - Never commit private keys or RPC URLs.

2. Install dependencies from the repo root:
   - `pnpm install`

3. Compile:
   - `pnpm --filter @pledgebook/contracts compile`

4. Test:
   - `pnpm --filter @pledgebook/contracts test`

## Deployment

- Local node:
  - `pnpm --filter @pledgebook/contracts deploy:local`
- Polygon Amoy (testnet):
  - `pnpm --filter @pledgebook/contracts deploy:amoy`
- Polygon mainnet:
  - `pnpm --filter @pledgebook/contracts deploy:polygon`

## Preflight checks

- `pnpm --filter @pledgebook/contracts preflight:amoy`
- `pnpm --filter @pledgebook/contracts preflight:polygon`

Set `EXPECTED_CHAIN_ID` to prevent accidental cross-chain deployments. Use `DRY_RUN=true` to validate without deploying.

For keystore-based deployments, set `DEPLOYER_KEYSTORE_PATH` and `DEPLOYER_KEYSTORE_PASSWORD` instead of `DEPLOYER_PRIVATE_KEY`.
For HD wallets, set `DEPLOYER_MNEMONIC` and optionally `DEPLOYER_MNEMONIC_PATH`.

## Security tooling

- Slither: `pnpm --filter @pledgebook/contracts analyze:slither`
- Mythril: `pnpm --filter @pledgebook/contracts analyze:mythril`

## Security notes

- Use a dedicated deployer key with minimal funds.
- Store secrets in a secure vault (e.g., 1Password, AWS Secrets Manager).
- Use hardware wallets for mainnet operations when possible.
- Rotate keys regularly and revoke compromised credentials immediately.
- Review and verify addresses (USDC, Aave Pool, CRE oracle, treasury) before deployment.
