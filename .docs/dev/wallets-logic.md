# PledgeBook Product Development Document (Continued)

## Phase 13: Wallet Guidance for Local Development and Testing

**Objective**: Provide comprehensive guidance on the wallets required for PledgeBook's local development and testing, ensuring secure, efficient, and reproducible workflows. This phase focuses on best practices for handling wallets in a Windows/VS Code environment, integrating with Polygon testnets, smart contracts, CRE workflows, and frontend (Nuxt). Wallets are essential for simulating user actions (e.g., creating campaigns, pledging USDC), testing auth (SIWE), and verifying funds flow without risking real assets. The approach emphasizes security (no mainnet keys locally), isolation (testnet-only), and automation (Hardhat scripts for accounts).

**Deliverables**:

- List of required wallet types and tools.
- Best practices for setup, management, and testing.
- Code snippets for integration (e.g., Hardhat config, Nuxt composables).
- Troubleshooting for common Windows issues.

**Standards, Patterns, Conventions, and Best Practices** (Carmack-Inspired):

- **Testnet-Only Locally**: Never use mainnet wallets or real funds in dev; isolate with separate mnemonics. Carmack: "Test in isolated environments to avoid real-world disasters."
- **Mnemonic-Based Accounts**: Use deterministic mnemonics for reproducible testing (e.g., creator/pledger wallets).
- **Security**: Store mnemonics in .env (gitignored); encrypt if shared; use disposable test accounts.
- **Automation**: Hardhat tasks for funding test wallets (faucets); Playwright for E2E wallet simulations.
- **Multi-Wallet Testing**: Simulate multiple actors (creator, pledger, voucher) with distinct accounts.
- **Error Handling**: Fallback to mock wallets in CI/tests; log wallet errors clearly.
- **Best Practices**: Rotate mnemonics per test run; use Alchemy/Infura for RPC to avoid local nodes; monitor testnet balances.
- **Windows-Specific**: Use PowerShell for env var loading; VS Code extensions (MetaMask, Solidity) for wallet inspection.
- **Testing Gate**: Run Hardhat tests with multiple wallets; Playwright E2E with mock sign-ins; validate no mainnet leaks. Junior task: Set up a new test wallet and fund it via faucet.

### 13.1: Required Wallets and Tools

PledgeBook requires test wallets for local dev/testing. No real (mainnet) wallets needed locally — all on Polygon testnet (Amoy recommended in 2026 for stability).

- **Primary Wallet Tool: MetaMask (Browser Extension)**
  - Purpose: Frontend testing (Nuxt UI, connect/pledge actions).
  - Setup: Install from metamask.io; create/import test accounts.
  - Why: Seamless with Wagmi/Reown; supports Polygon Amoy (add chain: RPC https://rpc-amoy.polygon.technology, chainID 80002).

- **Secondary Tool: Hardhat Built-In Wallets (Mnemonic-Derived)**
  - Purpose: Contract testing/deploy (e.g., simulate creator/pledger in Hardhat scripts).
  - Setup: Use default mnemonic in hardhat.config.ts; generate 10+ accounts.

- **Faucet Tools for Funding**:
  - Polygon Amoy Faucet (faucet.polygon.technology) — for test MATIC.
  - Chainlink Faucet (faucets.chain.link) — for test LINK (CRE subscriptions).
  - Aave Testnet Faucet (if yields) — for test USDC.

- **Optional: WalletConnect (Mobile Testing)**
  - Purpose: Test mobile/responsive wallet flows.
  - Setup: Use WalletConnect-compatible app (e.g., Rainbow mobile) with your MetaMask test accounts.

### 13.2: Best Practices for Local Development

- **Wallet Setup Sequence**:
  1. Install MetaMask extension in Chrome/Brave (VS Code integrated browser if needed).
  2. Create a new test wallet (mnemonic: save securely in .env as TEST_MNEMONIC).
  3. Add Polygon Amoy network (RPC: https://rpc-amoy.polygon.technology, chainID: 80002, symbol: MATIC, explorer: https://www.oklink.com/amoy).
  4. Fund with test MATIC from faucet (request 2–5 MATIC).
  5. Import test USDC contract (0x... public test USDC on Amoy) and fund via faucet if available, or mint in Hardhat fork.

- **Environment Isolation**:
  - Local: Use .env.local with test mnemonic/RPC.
  - Never mix mainnet/staging keys — use separate MetaMask profiles.
  - In Hardhat: Fork Amoy for realistic testing (hardhat.config.ts networks: { hardhat: { fork: 'https://rpc-amoy.polygon.technology' } }).

- **Security Practices**:
  - .env gitignore; use dotenv for loading.
  - Rotate test mnemonics if compromised (generate new via ethers.js script).
  - No real funds — use mocks for USDC in tests (deploy MockUSDC.sol).
  - Audit wallet flows: Ensure no private key exposure in frontend.

- **Testing Practices**:
  - Unit (Vitest): Mock Wagmi for connect/sign.
  - E2E (Playwright): Automate MetaMask extension (playwright.config.ts with browser args for extension path).
  - Hardhat: Use accounts[0] as creator, [1] as pledger; test pledge → verify.

- **Windows-Specific Tips**:
  - PowerShell for env: `$env:PRIVATE_KEY = '0x...'`
  - VS Code: Install "MetaMask" extension for wallet inspection; "Solidity" for contract highlighting.
  - Faucet Issues: If browser blocks, use curl in CMD: `curl -X POST https://faucet.polygon.technology -d "address=your_address"`.

### 13.3: Code Snippets for Integration

- **Hardhat Config** (packages/contracts/hardhat.config.ts):

  ```ts
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [process.env.PRIVATE_KEY]
    },
  }
  ```

- **Nuxt Composable** (apps/web/composables/useWallet.ts):

  ```ts
  export const useWallet = () => {
    const config = useRuntimeConfig()
    const address = ref(null)

    const connect = async () => {
      // Wagmi connect logic
      address.value = '0xTestAddress' // Mock for local
    }

    return { connect, address }
  }
  ```

### 13.4: Common Issues & Troubleshooting

- "Insufficient Funds": Fund test wallet via faucet; check balance on explorer.oklink.com/amoy.
- "Network Error": Use reliable RPC like Alchemy (free tier).
- "Signature Invalid": Ensure nonce/timestamp in SIWE message; test with Viem signMessage.

This phase sets up wallets for seamless dev/testing. Ready for Phase 14 or a specific wallet setup script?
