import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'

/**
 * End-to-End Demo Test on Local Hardhat
 *
 * Simulates the complete flow:
 * 1. Deploy contracts
 * 2. Create campaign
 * 3. Pledgers back it
 * 4. Fast-forward past end date
 * 5. Oracle verifies (success or failure)
 * 6. All parties claim their funds
 */

const ONE_USDC = 1n * 10n ** 6n
const MIN_BOND = 10n * ONE_USDC

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║       PLEDGEBOOK E2E TEST - LOCAL HARDHAT                ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  const [_deployer, creator, pledger1, pledger2, voucher, _disputer, oracle, treasury] =
    await ethers.getSigners()

  // === DEPLOY CONTRACTS ===
  console.log('📦 DEPLOYING CONTRACTS...\n')

  const MockUSDC = await ethers.getContractFactory('MockUSDC')
  const usdc = await MockUSDC.deploy()
  console.log('  MockUSDC:', await usdc.getAddress())

  const MockAavePool = await ethers.getContractFactory('MockAavePool')
  const aavePool = await MockAavePool.deploy()
  console.log('  MockAavePool:', await aavePool.getAddress())

  const Factory = await ethers.getContractFactory('CampaignFactory')
  const factory = await Factory.deploy(
    await usdc.getAddress(),
    await aavePool.getAddress(),
    oracle.address,
    treasury.address,
  )
  console.log('  CampaignFactory:', await factory.getAddress())
  console.log('  Oracle:', oracle.address)
  console.log('  Treasury:', treasury.address)

  // === MINT TEST TOKENS ===
  console.log('\n💰 MINTING TEST USDC...\n')
  await usdc.mint(creator.address, 100n * ONE_USDC)
  await usdc.mint(pledger1.address, 500n * ONE_USDC)
  await usdc.mint(pledger2.address, 300n * ONE_USDC)
  await usdc.mint(voucher.address, 100n * ONE_USDC)
  console.log('  Creator: 100 USDC')
  console.log('  Pledger1: 500 USDC')
  console.log('  Pledger2: 300 USDC')
  console.log('  Voucher: 100 USDC')

  // === CREATE CAMPAIGN ===
  console.log('\n📝 CREATING CAMPAIGN...\n')
  const prompt = 'Write "chainlink" 20 times on paper'
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes(prompt))
  const endDate = (await time.latest()) + 86400 + 3600 // 1 day + 1 hour

  await usdc.connect(creator).approve(await factory.getAddress(), MIN_BOND)
  await factory
    .connect(creator)
    .createCampaign(endDate, promptHash, 500n * ONE_USDC, MIN_BOND, false)

  const escrowAddress = await factory.campaignEscrows(1)
  const escrow = await ethers.getContractAt('PledgeEscrow', escrowAddress)
  console.log('  Campaign ID: 1')
  console.log('  Escrow:', escrowAddress)
  console.log('  Prompt Hash:', promptHash)
  console.log('  Status:', await escrow.status(), '(0=Draft)')

  // === ACTIVATE CAMPAIGN ===
  console.log('\n🚀 ACTIVATING CAMPAIGN...\n')
  await escrow.connect(creator).approveCampaign()
  console.log('  Status:', await escrow.status(), '(1=Active)')
  console.log('  Creator bond deposited to Aave')

  // === PLEDGES & VOUCHES ===
  console.log('\n💸 PLEDGES & VOUCHES...\n')

  await usdc.connect(pledger1).approve(escrowAddress, 200n * ONE_USDC)
  await escrow.connect(pledger1).pledge(200n * ONE_USDC)
  console.log('  Pledger1 pledged: 200 USDC')

  await usdc.connect(pledger2).approve(escrowAddress, 100n * ONE_USDC)
  await escrow.connect(pledger2).pledge(100n * ONE_USDC)
  console.log('  Pledger2 pledged: 100 USDC')

  await usdc.connect(voucher).approve(escrowAddress, 50n * ONE_USDC)
  await escrow.connect(voucher).vouch(50n * ONE_USDC)
  console.log('  Voucher staked: 50 USDC')

  console.log('\n  📊 Campaign Stats:')
  console.log('    Total Pledged:', (await escrow.amountPledged()) / ONE_USDC, 'USDC')
  console.log('    Total Vouched:', (await escrow.totalVouched()) / ONE_USDC, 'USDC')

  // === FAST FORWARD TIME ===
  console.log('\n⏰ FAST-FORWARDING PAST END DATE...\n')
  await time.increaseTo(endDate + 1)
  console.log('  Current time now past campaign end date')

  // === ORACLE VERIFICATION ===
  console.log('\n🔮 ORACLE VERIFICATION (SUCCESS)...\n')

  const tx = await escrow.connect(oracle).verifyAndRelease(true, promptHash)
  const receipt = await tx.wait()
  console.log('  Transaction:', tx.hash)
  console.log('  Gas used:', receipt?.gasUsed.toString())
  console.log('  Status:', await escrow.status(), '(2=Complete)')
  console.log('  Finalized:', await escrow.finalized())
  console.log('  Outcome Success:', await escrow.outcomeSuccess())

  // === CLAIMS ===
  console.log('\n🏆 CLAIMING FUNDS...\n')

  // Track balances
  const creatorBefore = await usdc.balanceOf(creator.address)
  const treasuryBefore = await usdc.balanceOf(treasury.address)
  const voucherBefore = await usdc.balanceOf(voucher.address)

  // Creator claims
  await escrow.connect(creator).claimCreator()
  const creatorAfter = await usdc.balanceOf(creator.address)
  const creatorReceived = (creatorAfter - creatorBefore) / ONE_USDC
  console.log('  Creator claimed:', creatorReceived, 'USDC')
  console.log('    (pledges 300 + bond 10 - 1% fee 3 = 307)')

  // Treasury claims
  await escrow.connect(treasury).claimTreasury()
  const treasuryAfter = await usdc.balanceOf(treasury.address)
  const treasuryReceived = (treasuryAfter - treasuryBefore) / ONE_USDC
  console.log('  Treasury claimed:', treasuryReceived, 'USDC (1% fee)')

  // Voucher claims (full refund on success)
  await escrow.connect(voucher).claimVoucher()
  const voucherAfter = await usdc.balanceOf(voucher.address)
  const voucherReceived = (voucherAfter - voucherBefore) / ONE_USDC
  console.log('  Voucher claimed:', voucherReceived, 'USDC (full refund)')

  // === FINAL BALANCES ===
  console.log('\n📊 FINAL BALANCES:\n')
  console.log('  Creator:', (await usdc.balanceOf(creator.address)) / ONE_USDC, 'USDC')
  console.log('  Pledger1:', (await usdc.balanceOf(pledger1.address)) / ONE_USDC, 'USDC')
  console.log('  Pledger2:', (await usdc.balanceOf(pledger2.address)) / ONE_USDC, 'USDC')
  console.log('  Voucher:', (await usdc.balanceOf(voucher.address)) / ONE_USDC, 'USDC')
  console.log('  Treasury:', (await usdc.balanceOf(treasury.address)) / ONE_USDC, 'USDC')
  console.log('  Escrow:', (await usdc.balanceOf(escrowAddress)) / ONE_USDC, 'USDC (should be 0)')

  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║                    ✅ E2E TEST PASSED                     ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')
}

main().catch((error) => {
  console.error('❌ TEST FAILED:', error)
  process.exitCode = 1
})
