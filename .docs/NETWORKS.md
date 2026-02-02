# Networks and Addresses

## Target networks

- Polygon mainnet (chainId 137)
- Polygon Amoy testnet (chainId 80002)

Sources:

- blockchain/contracts/hardhat.config.ts
- apps/web/wrangler.toml

## USDC addresses

- Polygon mainnet USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
- Polygon Amoy USDC: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

Source: layers/shared/app/config/contracts.ts

## Aave V3 Pool addresses

- Polygon mainnet Aave V3 Pool: 0x794a61358D6845594F94dc1DB02A252b5b4814aD
  - Source: https://github.com/bgd-labs/aave-address-book/blob/main/src/ts/AaveV3Polygon.ts

- Polygon Amoy Aave V3 Pool: not listed in the Aave Address Book as of 2026-01-30.
  - Decision: use a mock Aave pool for Amoy/testnet until Aave V3 deploys on Amoy.
  - Action: update AAVE_POOL_ADDRESS in the testnet .env when a real deployment exists.
