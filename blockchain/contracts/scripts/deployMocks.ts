import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
import { writeFileSync } from 'node:fs'

dotenv.config()

/**
 * Deploys mock contracts for testnet (MockUSDC and MockAavePool)
 * and outputs the addresses to be used in .env
 */
async function main() {
  const [deployer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()

  console.log('='.repeat(60))
  console.log('Testnet Mock Deployment')
  console.log('='.repeat(60))
  console.log(`Network: ${network.name} (chainId: ${network.chainId})`)
  console.log(`Deployer: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Balance: ${ethers.formatEther(balance)} MATIC`)

  if (balance === 0n) {
    throw new Error(
      'Deployer has no MATIC. Get testnet MATIC from https://faucet.polygon.technology/',
    )
  }

  // Deploy MockUSDC
  console.log('\n1. Deploying MockUSDC...')
  const MockUSDC = await ethers.getContractFactory('MockUSDC')
  const usdc = await MockUSDC.deploy()
  await usdc.waitForDeployment()
  const usdcAddress = await usdc.getAddress()
  console.log(`   MockUSDC deployed to: ${usdcAddress}`)

  // Deploy MockAavePool
  console.log('\n2. Deploying MockAavePool...')
  const MockAavePool = await ethers.getContractFactory('MockAavePool')
  const aavePool = await MockAavePool.deploy()
  await aavePool.waitForDeployment()
  const aavePoolAddress = await aavePool.getAddress()
  console.log(`   MockAavePool deployed to: ${aavePoolAddress}`)

  // Mint some USDC to deployer for testing
  console.log('\n3. Minting test USDC to deployer...')
  const mintAmount = 100000n * 10n ** 6n // 100,000 USDC
  await usdc.mint(deployer.address, mintAmount)
  console.log(`   Minted ${ethers.formatUnits(mintAmount, 6)} USDC to ${deployer.address}`)

  // Output addresses
  console.log('\n' + '='.repeat(60))
  console.log('Deployment Complete!')
  console.log('='.repeat(60))
  console.log('\nAdd these to your .env file:')
  console.log(`USDC_ADDRESS=${usdcAddress}`)
  console.log(`AAVE_POOL_ADDRESS=${aavePoolAddress}`)
  console.log(`CRE_ORACLE_ADDRESS=${deployer.address}  # Use deployer for testing`)
  console.log(`TREASURY_ADDRESS=${deployer.address}    # Use deployer for testing`)

  // Create .env.testnet.deployed if it doesn't exist
  const envPath = '.env.testnet.deployed'
  const envContent = `# Auto-generated testnet deployment addresses
# Network: ${network.name} (chainId: ${network.chainId})
# Date: ${new Date().toISOString()}

USDC_ADDRESS=${usdcAddress}
AAVE_POOL_ADDRESS=${aavePoolAddress}
CRE_ORACLE_ADDRESS=${deployer.address}
TREASURY_ADDRESS=${deployer.address}
`
  writeFileSync(envPath, envContent)
  console.log(`\nAddresses saved to ${envPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
