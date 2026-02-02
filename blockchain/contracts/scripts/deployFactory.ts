import { ethers } from 'hardhat'
import { readFileSync } from 'node:fs'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function getExpectedChainId(): number | null {
  const raw = process.env.EXPECTED_CHAIN_ID
  if (!raw) return null
  const value = Number(raw)
  if (Number.isNaN(value)) {
    throw new TypeError('EXPECTED_CHAIN_ID must be a number')
  }
  return value
}

async function getDeployer() {
  const keystorePath = process.env.DEPLOYER_KEYSTORE_PATH
  const keystorePassword = process.env.DEPLOYER_KEYSTORE_PASSWORD

  if (keystorePath && keystorePassword) {
    const json = readFileSync(keystorePath, 'utf8')
    return ethers.Wallet.fromEncryptedJsonSync(json, keystorePassword).connect(ethers.provider)
  }

  const [signer] = await ethers.getSigners()
  return signer
}

async function main() {
  const usdc = requireEnv('USDC_ADDRESS')
  const aavePool = requireEnv('AAVE_POOL_ADDRESS')
  const creOracle = requireEnv('CRE_ORACLE_ADDRESS')
  const treasury = requireEnv('TREASURY_ADDRESS')

  ;[usdc, aavePool, creOracle, treasury].forEach((addr) => {
    if (!ethers.isAddress(addr)) {
      throw new Error(`Invalid address: ${addr}`)
    }
  })

  const expectedChainId = getExpectedChainId()
  const network = await ethers.provider.getNetwork()
  if (expectedChainId !== null && network.chainId !== BigInt(expectedChainId)) {
    throw new Error(
      `ChainId mismatch. Expected ${expectedChainId}, got ${network.chainId.toString()}`,
    )
  }

  const dryRun = process.env.DRY_RUN === 'true'
  if (dryRun) {
    console.log('Dry run enabled. Validation passed, no deployment executed.')
    return
  }

  const deployer = await getDeployer()
  const Factory = await ethers.getContractFactory('CampaignFactory')
  const factory = await Factory.connect(deployer).deploy(usdc, aavePool, creOracle, treasury)
  await factory.waitForDeployment()

  const address = await factory.getAddress()
  console.log(`CampaignFactory deployed to ${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
