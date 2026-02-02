import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'

const MIN_BOND = 10n * 10n ** 6n
const ONE_USDC = 1n * 10n ** 6n
const MIN_CAMPAIGN_DURATION = 86400 // 1 day in seconds

async function deployEscrow() {
  const [, creator, pledger, voucher, disputer, oracle, treasury] = await ethers.getSigners()

  const MockUSDC = await ethers.getContractFactory('MockUSDC')
  const usdc = await MockUSDC.deploy()

  const MockAavePool = await ethers.getContractFactory('MockAavePool')
  const aavePool = await MockAavePool.deploy()

  const endDate = (await time.latest()) + MIN_CAMPAIGN_DURATION + 3600 // 1 day + 1 hour
  const promptHash = ethers.keccak256(ethers.toUtf8Bytes('prompt'))

  const Escrow = await ethers.getContractFactory('PledgeEscrow')
  const escrow = await Escrow.deploy(
    await usdc.getAddress(),
    await aavePool.getAddress(),
    await oracle.getAddress(),
    await treasury.getAddress(),
    creator.address,
    1,
    endDate,
    promptHash,
    100n * ONE_USDC,
    MIN_BOND,
    false,
  )

  await usdc.mint(creator.address, MIN_BOND)
  await usdc.mint(pledger.address, 200n * ONE_USDC)
  await usdc.mint(voucher.address, 50n * ONE_USDC)
  await usdc.mint(disputer.address, 50n * ONE_USDC)

  // Transfer creator bond to escrow (simulating what Factory does)
  await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)

  await usdc.connect(pledger).approve(await escrow.getAddress(), 200n * ONE_USDC)
  await usdc.connect(voucher).approve(await escrow.getAddress(), 50n * ONE_USDC)
  await usdc.connect(disputer).approve(await escrow.getAddress(), 50n * ONE_USDC)

  return {
    escrow,
    usdc,
    creator,
    pledger,
    voucher,
    disputer,
    oracle,
    treasury,
    promptHash,
    endDate,
  }
}

describe('PledgeEscrow', () => {
  it('handles pledge, vouch, dispute flow', async () => {
    const { escrow, creator, pledger, voucher, disputer } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()

    await expect(escrow.connect(pledger).pledge(100n * ONE_USDC)).to.emit(escrow, 'Pledged')
    await expect(escrow.connect(voucher).vouch(10n * ONE_USDC)).to.emit(escrow, 'Vouched')

    await expect(escrow.connect(disputer).dispute(20n * ONE_USDC, 'invalid')).to.emit(
      escrow,
      'Disputed',
    )

    expect(await escrow.isDisputed()).to.equal(true)
  })

  it('releases funds on success and allows creator claim', async () => {
    const { escrow, creator, pledger, oracle, treasury, promptHash } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)

    await time.increaseTo((await escrow.endDate()) + 1n)

    await expect(escrow.connect(oracle).verifyAndRelease(true, promptHash)).to.emit(
      escrow,
      'Verified',
    )

    const token = await ethers.getContractAt('MockUSDC', await escrow.usdc())
    const creatorStart = await token.balanceOf(creator.address)

    await expect(escrow.connect(creator).claimCreator()).to.emit(escrow, 'CreatorClaimed')

    const creatorEnd = await token.balanceOf(creator.address)
    const expectedTreasuryFee = ONE_USDC
    const expectedClaim = 100n * ONE_USDC + MIN_BOND - expectedTreasuryFee

    expect(creatorEnd - creatorStart).to.equal(expectedClaim)

    await expect(escrow.connect(treasury).claimTreasury()).to.emit(escrow, 'TreasuryCollected')
  })

  it('refunds pledgers on failure', async () => {
    const { escrow, creator, pledger, oracle, promptHash } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(50n * ONE_USDC)

    await time.increaseTo((await escrow.endDate()) + 1n)

    await escrow.connect(oracle).verifyAndRelease(false, promptHash)

    const token = await ethers.getContractAt('MockUSDC', await escrow.usdc())
    const before = await token.balanceOf(pledger.address)

    await expect(escrow.connect(pledger).claimPledgeRefund()).to.emit(escrow, 'Refunded')

    const after = await token.balanceOf(pledger.address)
    expect(after - before).to.equal(50n * ONE_USDC)
  })

  it('allows emergency finalization after grace period', async () => {
    const { escrow, creator, pledger, treasury } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(50n * ONE_USDC)

    // Fast forward past end date + grace period (30 days)
    const endDate = await escrow.endDate()
    const gracePeriod = 30 * 24 * 60 * 60 // 30 days in seconds
    await time.increaseTo(endDate + BigInt(gracePeriod) + 1n)

    // Anyone can trigger emergency finalization
    await expect(escrow.emergencyFinalize()).to.emit(escrow, 'Verified')

    // Pledgers should be able to claim refunds
    const token = await ethers.getContractAt('MockUSDC', await escrow.usdc())
    const before = await token.balanceOf(pledger.address)

    await escrow.connect(pledger).claimPledgeRefund()

    const after = await token.balanceOf(pledger.address)
    expect(after - before).to.equal(50n * ONE_USDC)

    // Creator bond goes to treasury
    const treasuryBalanceBefore = await token.balanceOf(treasury.address)
    await expect(escrow.connect(treasury).claimTreasury()).to.emit(escrow, 'TreasuryCollected')
    const treasuryBalanceAfter = await token.balanceOf(treasury.address)
    expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(MIN_BOND)
  })

  it('slashes vouchers when campaign fails due to fraud', async () => {
    const {
      escrow,
      usdc,
      creator,
      pledger,
      voucher,
      oracle,
      treasury: _treasury,
      promptHash,
    } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)
    await escrow.connect(voucher).vouch(10n * ONE_USDC)

    await time.increaseTo((await escrow.endDate()) + 1n)

    // Campaign fails (fraud detected)
    await escrow.connect(oracle).verifyAndRelease(false, promptHash)

    const voucherBalanceBefore = await usdc.balanceOf(voucher.address)

    // Voucher claims - should be slashed 50%
    await expect(escrow.connect(voucher).claimVoucher())
      .to.emit(escrow, 'VoucherSlashed')
      .and.to.emit(escrow, 'VoucherReleased')

    const voucherBalanceAfter = await usdc.balanceOf(voucher.address)
    const expectedRefund = 5n * ONE_USDC // 50% of 10 USDC

    expect(voucherBalanceAfter - voucherBalanceBefore).to.equal(expectedRefund)
  })

  it('slashes disputers when campaign succeeds (frivolous dispute)', async () => {
    const { escrow, usdc, creator, pledger, disputer, oracle, promptHash } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)
    await escrow.connect(disputer).dispute(5n * ONE_USDC, 'frivolous')

    await time.increaseTo((await escrow.endDate()) + 1n)

    // Campaign succeeds - dispute was frivolous
    await escrow.connect(oracle).verifyAndRelease(true, promptHash)

    const disputerBalanceBefore = await usdc.balanceOf(disputer.address)

    // Disputer claims - should be slashed 50%
    await expect(escrow.connect(disputer).claimDisputeStake())
      .to.emit(escrow, 'DisputeSlashed')
      .and.to.emit(escrow, 'DisputeReleased')

    const disputerBalanceAfter = await usdc.balanceOf(disputer.address)
    const expectedRefund = 2n * ONE_USDC + 500000n // 50% of 5 USDC = 2.5 USDC

    expect(disputerBalanceAfter - disputerBalanceBefore).to.equal(expectedRefund)
  })

  it('takes pledge snapshot at first post-endDate dispute (flash-loan protection)', async () => {
    const { escrow, creator, pledger, disputer } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)

    // Fast forward past end date
    await time.increaseTo((await escrow.endDate()) + 1n)

    // First dispute should trigger snapshot
    await expect(escrow.connect(disputer).dispute(5n * ONE_USDC, 'test'))
      .to.emit(escrow, 'PledgeSnapshotTaken')
      .withArgs(1, 100n * ONE_USDC)

    expect(await escrow.snapshotTaken()).to.equal(true)
    expect(await escrow.snapshotPledged()).to.equal(100n * ONE_USDC)
  })

  it('does not slash vouchers when campaign simply fails without fraud', async () => {
    const { escrow, usdc, creator, pledger, voucher } = await deployEscrow()

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(50n * ONE_USDC)
    await escrow.connect(voucher).vouch(10n * ONE_USDC)

    // Emergency finalize (no fraud flag, just timeout)
    const endDate = await escrow.endDate()
    const gracePeriod = 30 * 24 * 60 * 60
    await time.increaseTo(endDate + BigInt(gracePeriod) + 1n)
    await escrow.emergencyFinalize()

    const voucherBalanceBefore = await usdc.balanceOf(voucher.address)

    // Voucher claims - should NOT be slashed (no fraud flag)
    await escrow.connect(voucher).claimVoucher()

    const voucherBalanceAfter = await usdc.balanceOf(voucher.address)
    expect(voucherBalanceAfter - voucherBalanceBefore).to.equal(10n * ONE_USDC) // Full refund
  })
})
