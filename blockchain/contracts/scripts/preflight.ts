import { ethers } from 'hardhat'

const REQUIRED = ['USDC_ADDRESS', 'AAVE_POOL_ADDRESS', 'CRE_ORACLE_ADDRESS', 'TREASURY_ADDRESS']

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

async function main() {
  const addresses = REQUIRED.map(requireEnv)

  for (const addr of addresses) {
    if (!ethers.isAddress(addr)) {
      throw new Error(`Invalid address: ${addr}`)
    }
  }

  const expected = process.env.EXPECTED_CHAIN_ID
  if (expected) {
    const chainId = (await ethers.provider.getNetwork()).chainId
    if (chainId !== BigInt(Number(expected))) {
      throw new Error(`ChainId mismatch. Expected ${expected}, got ${chainId.toString()}`)
    }
  }

  console.log('Preflight checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
