import { ethers } from 'hardhat'

/**
 * Deploy all contracts to local Hardhat network for demo testing.
 *
 * Usage:
 *   npx hardhat node                         # Terminal 1: Start local node
 *   npx hardhat run scripts/deployLocal.ts --network localhost  # Terminal 2: Deploy
 */

const ONE_USDC = 1n * 10n ** 6n
const MIN_BOND = 10n * ONE_USDC

async function main() {
  const [deployer, creator, pledger, voucher, disputer, oracle, treasury] =
    await ethers.getSigners()

  console.log('=== Deploying to Local Hardhat Network ===\n')
  console.log('Deployer:', deployer.address)
  console.log('Oracle:', oracle.address)
  console.log('Treasury:', treasury.address)
  console.log('')

  // Deploy Mock USDC
  console.log('Deploying MockUSDC...')
  const MockUSDC = await ethers.getContractFactory('MockUSDC')
  const usdc = await MockUSDC.deploy()
  await usdc.waitForDeployment()
  console.log('MockUSDC:', await usdc.getAddress())

  // Deploy Mock Aave Pool
  console.log('Deploying MockAavePool...')
  const MockAavePool = await ethers.getContractFactory('MockAavePool')
  const aavePool = await MockAavePool.deploy()
  await aavePool.waitForDeployment()
  console.log('MockAavePool:', await aavePool.getAddress())

  // Deploy Campaign Factory
  console.log('Deploying CampaignFactory...')
  const Factory = await ethers.getContractFactory('CampaignFactory')
  const factory = await Factory.deploy(
    await usdc.getAddress(),
    await aavePool.getAddress(),
    oracle.address,
    treasury.address,
  )
  await factory.waitForDeployment()
  console.log('CampaignFactory:', await factory.getAddress())

  // Mint test USDC to all participants
  console.log('\n=== Minting Test USDC ===')
  const mintAmounts = [
    { account: creator, name: 'Creator', amount: 1000n * ONE_USDC },
    { account: pledger, name: 'Pledger', amount: 5000n * ONE_USDC },
    { account: voucher, name: 'Voucher', amount: 1000n * ONE_USDC },
    { account: disputer, name: 'Disputer', amount: 1000n * ONE_USDC },
  ]

  for (const { account, name, amount } of mintAmounts) {
    await usdc.mint(account.address, amount)
    console.log(`${name} (${account.address}): ${amount / ONE_USDC} USDC`)
  }

  // Create a demo campaign
  console.log('\n=== Creating Demo Campaign ===')
  const prompt = 'Write the word "chainlink" 20 times on a piece of paper'
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes(prompt))
  const endDate = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days from now
  const fundraisingGoal = 500n * ONE_USDC

  await usdc.connect(creator).approve(await factory.getAddress(), MIN_BOND)
  const tx = await factory.connect(creator).createCampaign(
    endDate,
    promptHash,
    fundraisingGoal,
    MIN_BOND,
    false, // not privacy mode
  )
  const receipt = await tx.wait()

  const campaignCreatedEvent = receipt?.logs
    .map((log) => {
      try {
        return factory.interface.parseLog({ topics: [...log.topics], data: log.data })
      } catch {
        return null
      }
    })
    .find((parsed) => parsed?.name === 'CampaignCreated')

  const campaignId = campaignCreatedEvent?.args.id
  const escrowAddress = await factory.campaignEscrows(campaignId)

  console.log('Campaign ID:', campaignId?.toString())
  console.log('Escrow Address:', escrowAddress)
  console.log('Prompt Hash:', promptHash)
  console.log('End Date:', new Date(endDate * 1000).toISOString())

  // Activate campaign
  console.log('\n=== Activating Campaign ===')
  const escrow = await ethers.getContractAt('PledgeEscrow', escrowAddress)
  await escrow.connect(creator).approveCampaign()
  console.log('Campaign status:', await escrow.status()) // Should be 1 (Active)

  // Add some pledges
  console.log('\n=== Adding Test Pledges ===')
  await usdc.connect(pledger).approve(escrowAddress, 200n * ONE_USDC)
  await escrow.connect(pledger).pledge(200n * ONE_USDC)
  console.log('Pledged 200 USDC')
  console.log('Total pledged:', (await escrow.amountPledged()) / ONE_USDC, 'USDC')

  // Output deployment info for .env
  console.log('\n=== Environment Variables for .env ===')
  console.log(`USDC_ADDRESS=${await usdc.getAddress()}`)
  console.log(`AAVE_POOL_ADDRESS=${await aavePool.getAddress()}`)
  console.log(`FACTORY_ADDRESS=${await factory.getAddress()}`)
  console.log(`CRE_ORACLE_ADDRESS=${oracle.address}`)
  console.log(`TREASURY_ADDRESS=${treasury.address}`)
  console.log(`DEMO_CAMPAIGN_ID=${campaignId}`)
  console.log(`DEMO_ESCROW_ADDRESS=${escrowAddress}`)
  console.log(`DEMO_PROMPT_HASH=${promptHash}`)

  // Output account private keys (for testing only!)
  console.log('\n=== Test Account Private Keys (DO NOT USE IN PRODUCTION) ===')
  console.log('These are Hardhat default accounts, known keys!')
  console.log(
    'Oracle (account 5):',
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  )
  console.log(
    'Creator (account 1):',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  )

  console.log('\n=== Deployment Complete ===')
  console.log('\nTo interact with the demo:')
  console.log('1. Use the Oracle account to call verifyAndRelease(true/false, promptHash)')
  console.log('2. Use the Creator account to claim funds after verification')
  console.log('3. The demo campaign expires in 7 days')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
