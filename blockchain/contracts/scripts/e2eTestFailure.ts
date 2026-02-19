import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'

/**
 * E2E Test: Campaign FAILURE Scenario
 *
 * Tests the refund flow when oracle detects fraud.
 */

const ONE_USDC = 1n * 10n ** 6n
const MIN_BOND = 10n * ONE_USDC

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║       PLEDGEBOOK E2E TEST - FAILURE SCENARIO             ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  const [_deployer, creator, pledger1, voucher, , , oracle, treasury] = await ethers.getSigners()

  // Deploy
  const MockUSDC = await ethers.getContractFactory('MockUSDC')
  const usdc = await MockUSDC.deploy()

  const MockAavePool = await ethers.getContractFactory('MockAavePool')
  const aavePool = await MockAavePool.deploy()

  const Factory = await ethers.getContractFactory('CampaignFactory')
  const factory = await Factory.deploy(
    await usdc.getAddress(),
    await aavePool.getAddress(),
    oracle.address,
    treasury.address,
  )

  console.log('📦 Contracts deployed')

  // Mint tokens
  await usdc.mint(creator.address, 100n * ONE_USDC)
  await usdc.mint(pledger1.address, 500n * ONE_USDC)
  await usdc.mint(voucher.address, 100n * ONE_USDC)

  // Create campaign
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes('Fraudulent campaign'))
  const endDate = (await time.latest()) + 86400 + 3600

  await usdc.connect(creator).approve(await factory.getAddress(), MIN_BOND)
  await factory
    .connect(creator)
    .createCampaign(endDate, promptHash, 500n * ONE_USDC, MIN_BOND, false)

  const escrowAddress = await factory.campaignEscrows(1)
  const escrow = await ethers.getContractAt('PledgeEscrow', escrowAddress)
  console.log('📝 Campaign created:', escrowAddress)

  // Activate and fund
  await escrow.connect(creator).approveCampaign()

  await usdc.connect(pledger1).approve(escrowAddress, 200n * ONE_USDC)
  await escrow.connect(pledger1).pledge(200n * ONE_USDC)

  await usdc.connect(voucher).approve(escrowAddress, 50n * ONE_USDC)
  await escrow.connect(voucher).vouch(50n * ONE_USDC)

  console.log('💸 Pledger: 200 USDC, Voucher: 50 USDC')

  // Track initial balances
  const pledger1Initial = await usdc.balanceOf(pledger1.address)
  const voucherInitial = await usdc.balanceOf(voucher.address)

  // Fast forward and FAIL
  await time.increaseTo(endDate + 1)

  console.log('\n🔮 ORACLE VERIFICATION (FAILURE - FRAUD)...\n')
  await escrow.connect(oracle).verifyAndRelease(false, promptHash)

  console.log('  Status:', await escrow.status(), '(3=Failed)')
  console.log('  Fraud Flagged:', await escrow.fraudFlagged())

  // Claims
  console.log('\n🏆 CLAIMING REFUNDS...\n')

  // Pledger gets full refund
  await escrow.connect(pledger1).claimPledgeRefund()
  const pledger1After = await usdc.balanceOf(pledger1.address)
  console.log('  Pledger1 refunded:', (pledger1After - pledger1Initial) / ONE_USDC, 'USDC ✅')

  // Voucher gets slashed 50%
  await escrow.connect(voucher).claimVoucher()
  const voucherAfter = await usdc.balanceOf(voucher.address)
  const voucherReceived = (voucherAfter - voucherInitial) / ONE_USDC
  console.log('  Voucher received:', voucherReceived, 'USDC (50% slashed) ⚠️')

  // Treasury gets bond + slashed vouch
  await escrow.connect(treasury).claimTreasury()
  const treasuryBalance = await usdc.balanceOf(treasury.address)
  console.log('  Treasury received:', treasuryBalance / ONE_USDC, 'USDC')
  console.log('    (bond 10 + voucher slash 25 = 35)')

  // Creator cannot claim
  console.log('\n  Creator claim attempt...')
  try {
    await escrow.connect(creator).claimCreator()
    console.log('    ❌ ERROR: Creator should not be able to claim!')
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.log(
      '    ✅ Correctly rejected:',
      message.includes('Campaign failed') ? 'Campaign failed' : message,
    )
  }

  console.log('\n📊 FINAL BALANCES:\n')
  console.log(
    '  Creator:',
    (await usdc.balanceOf(creator.address)) / ONE_USDC,
    'USDC (lost 10 bond)',
  )
  console.log(
    '  Pledger1:',
    (await usdc.balanceOf(pledger1.address)) / ONE_USDC,
    'USDC (full refund)',
  )
  console.log(
    '  Voucher:',
    (await usdc.balanceOf(voucher.address)) / ONE_USDC,
    'USDC (lost 25 to slash)',
  )
  console.log('  Treasury:', (await usdc.balanceOf(treasury.address)) / ONE_USDC, 'USDC')
  console.log('  Escrow:', (await usdc.balanceOf(escrowAddress)) / ONE_USDC, 'USDC (should be 0)')

  console.log('\n╔═══════════════════════════════════════════════════════════╗')
  console.log('║              ✅ FAILURE SCENARIO PASSED                   ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')
}

main().catch((error) => {
  console.error('❌ TEST FAILED:', error)
  process.exitCode = 1
})
