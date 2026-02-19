import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import type { PledgeEscrow, MockUSDC, CampaignFactory } from '../typechain-types'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

/**
 * Integration Tests: Full Demo Workflow
 *
 * These tests simulate the complete Pledgebook demo flow:
 * 1. Factory creates campaign with creator bond
 * 2. Creator activates campaign
 * 3. Pledgers back the campaign
 * 4. Vouchers stake reputation
 * 5. Oracle (CRE) verifies outcome
 * 6. All parties claim their funds
 */

const MIN_BOND = 10n * 10n ** 6n // 10 USDC
const ONE_USDC = 1n * 10n ** 6n
const MIN_CAMPAIGN_DURATION = 86400 // 1 day

describe('PledgeEscrow Integration: Full Demo Workflow', () => {
  let factory: CampaignFactory
  let escrow: PledgeEscrow
  let usdc: MockUSDC

  let _admin: HardhatEthersSigner
  let creator: HardhatEthersSigner
  let pledger1: HardhatEthersSigner
  let pledger2: HardhatEthersSigner
  let voucher: HardhatEthersSigner
  let disputer: HardhatEthersSigner
  let oracle: HardhatEthersSigner
  let treasury: HardhatEthersSigner

  let promptHash: string
  let campaignId: bigint

  beforeEach(async () => {
    ;[_admin, creator, pledger1, pledger2, voucher, disputer, oracle, treasury] =
      await ethers.getSigners()

    // Deploy mock contracts
    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    // Deploy factory
    const Factory = await ethers.getContractFactory('CampaignFactory')
    factory = await Factory.deploy(
      await usdc.getAddress(),
      await aavePool.getAddress(),
      oracle.address,
      treasury.address,
    )

    // Mint USDC to all participants
    await usdc.mint(creator.address, 100n * ONE_USDC)
    await usdc.mint(pledger1.address, 1000n * ONE_USDC)
    await usdc.mint(pledger2.address, 500n * ONE_USDC)
    await usdc.mint(voucher.address, 100n * ONE_USDC)
    await usdc.mint(disputer.address, 100n * ONE_USDC)

    // Create campaign through factory
    promptHash = ethers.keccak256(ethers.toUtf8Bytes('Write chainlink 20 times on paper'))
    const endDate = (await time.latest()) + MIN_CAMPAIGN_DURATION + 3600

    await usdc.connect(creator).approve(await factory.getAddress(), MIN_BOND)
    await factory.connect(creator).createCampaign(
      endDate,
      promptHash,
      500n * ONE_USDC, // fundraising goal
      MIN_BOND,
      false, // not privacy mode
    )

    campaignId = 1n
    const escrowAddress = await factory.campaignEscrows(campaignId)
    escrow = await ethers.getContractAt('PledgeEscrow', escrowAddress)

    // Approve escrow to spend tokens
    await usdc.connect(pledger1).approve(escrowAddress, 1000n * ONE_USDC)
    await usdc.connect(pledger2).approve(escrowAddress, 500n * ONE_USDC)
    await usdc.connect(voucher).approve(escrowAddress, 100n * ONE_USDC)
    await usdc.connect(disputer).approve(escrowAddress, 100n * ONE_USDC)
  })

  describe('Scenario 1: Successful Campaign (Happy Path)', () => {
    it('should complete full flow: create → pledge → verify SUCCESS → claim', async () => {
      // Track initial balances
      const creatorInitial = await usdc.balanceOf(creator.address)
      const _pledger1Initial = await usdc.balanceOf(pledger1.address)
      const treasuryInitial = await usdc.balanceOf(treasury.address)

      // === Phase 1: Creator activates campaign ===
      await escrow.connect(creator).approveCampaign()
      expect(await escrow.status()).to.equal(1) // Status.Active

      // === Phase 2: Pledgers back the campaign ===
      await escrow.connect(pledger1).pledge(200n * ONE_USDC)
      await escrow.connect(pledger2).pledge(100n * ONE_USDC)

      expect(await escrow.amountPledged()).to.equal(300n * ONE_USDC)
      expect(await escrow.pledges(pledger1.address)).to.equal(200n * ONE_USDC)
      expect(await escrow.pledges(pledger2.address)).to.equal(100n * ONE_USDC)

      // === Phase 3: Voucher stakes reputation ===
      await escrow.connect(voucher).vouch(50n * ONE_USDC)
      expect(await escrow.totalVouched()).to.equal(50n * ONE_USDC)

      // === Phase 4: Campaign ends, oracle verifies SUCCESS ===
      await time.increaseTo((await escrow.endDate()) + 1n)

      await expect(escrow.connect(oracle).verifyAndRelease(true, promptHash))
        .to.emit(escrow, 'Verified')
        .withArgs(campaignId, true)

      expect(await escrow.status()).to.equal(2) // Status.Complete
      expect(await escrow.finalized()).to.equal(true)
      expect(await escrow.outcomeSuccess()).to.equal(true)

      // === Phase 5: All parties claim ===

      // Creator claims pledges + bond - treasury fee
      const treasuryFee = (300n * ONE_USDC * 100n) / 10000n // 1% of pledges
      const expectedCreatorClaim = 300n * ONE_USDC + MIN_BOND - treasuryFee

      await expect(escrow.connect(creator).claimCreator())
        .to.emit(escrow, 'CreatorClaimed')
        .to.emit(escrow, 'FundsReleased')

      const creatorFinal = await usdc.balanceOf(creator.address)
      // Creator started with 100, paid 10 bond, then gets 307 back = 397
      // But creatorInitial was captured AFTER paying bond, so it's 90
      expect(creatorFinal).to.equal(creatorInitial + expectedCreatorClaim)

      // Voucher claims full amount (no slash on success)
      await expect(escrow.connect(voucher).claimVoucher()).to.emit(escrow, 'VoucherReleased')

      expect(await usdc.balanceOf(voucher.address)).to.equal(100n * ONE_USDC) // started with 100, vouched 50, got 50 back

      // Treasury claims fee
      await expect(escrow.connect(treasury).claimTreasury()).to.emit(escrow, 'TreasuryCollected')

      const treasuryFinal = await usdc.balanceOf(treasury.address)
      expect(treasuryFinal - treasuryInitial).to.equal(treasuryFee)

      // Pledgers cannot claim refund on success
      await expect(escrow.connect(pledger1).claimPledgeRefund()).to.be.revertedWith(
        'Campaign succeeded',
      )
    })
  })

  describe('Scenario 2: Failed Campaign (Fraud Detected)', () => {
    it('should complete full flow: create → pledge → verify FAIL → refund + slash', async () => {
      const pledger1Initial = await usdc.balanceOf(pledger1.address)
      const voucherInitial = await usdc.balanceOf(voucher.address)

      // Activate and fund
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(200n * ONE_USDC)
      await escrow.connect(voucher).vouch(50n * ONE_USDC)

      // Campaign ends, oracle verifies FAILURE (fraud)
      await time.increaseTo((await escrow.endDate()) + 1n)

      await expect(escrow.connect(oracle).verifyAndRelease(false, promptHash))
        .to.emit(escrow, 'Verified')
        .withArgs(campaignId, false)
        .to.emit(escrow, 'Forfeited')
        .withArgs(campaignId, MIN_BOND)

      expect(await escrow.status()).to.equal(3) // Status.Failed
      expect(await escrow.fraudFlagged()).to.equal(true)

      // Pledger gets full refund
      await escrow.connect(pledger1).claimPledgeRefund()
      const pledger1Final = await usdc.balanceOf(pledger1.address)
      expect(pledger1Final).to.equal(pledger1Initial)

      // Voucher gets slashed 50%
      await expect(escrow.connect(voucher).claimVoucher())
        .to.emit(escrow, 'VoucherSlashed')
        .withArgs(campaignId, voucher.address, 25n * ONE_USDC) // 50% of 50 USDC

      const voucherFinal = await usdc.balanceOf(voucher.address)
      expect(voucherFinal - voucherInitial + 50n * ONE_USDC).to.equal(25n * ONE_USDC) // only got 25 back

      // Treasury gets creator bond + slashed voucher funds
      const treasuryClaimable = await escrow.treasuryClaimable()
      expect(treasuryClaimable).to.equal(MIN_BOND + 25n * ONE_USDC)

      // Creator cannot claim
      await expect(escrow.connect(creator).claimCreator()).to.be.revertedWith('Campaign failed')
    })
  })

  describe('Scenario 3: Disputed Campaign', () => {
    it('should handle dispute flow: pledge → dispute → verify SUCCESS → slash disputers', async () => {
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(100n * ONE_USDC)

      // Disputer stakes (frivolous dispute)
      await escrow.connect(disputer).dispute(20n * ONE_USDC, 'I think this is fraud')

      expect(await escrow.isDisputed()).to.equal(true)
      expect(await escrow.status()).to.equal(4) // Status.Disputed

      // Oracle verifies SUCCESS (dispute was frivolous)
      await time.increaseTo((await escrow.endDate()) + 1n)
      await escrow.connect(oracle).verifyAndRelease(true, promptHash)

      // Disputer gets slashed 50%
      await expect(escrow.connect(disputer).claimDisputeStake())
        .to.emit(escrow, 'DisputeSlashed')
        .withArgs(campaignId, disputer.address, 10n * ONE_USDC)

      // Disputer should have: 100 - 20 + 10 = 90 USDC (lost 10 to slash)
      expect(await usdc.balanceOf(disputer.address)).to.equal(90n * ONE_USDC)
    })

    it('should reward disputers when campaign fails (valid dispute)', async () => {
      const disputerInitial = await usdc.balanceOf(disputer.address)

      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(100n * ONE_USDC)
      await escrow.connect(disputer).dispute(20n * ONE_USDC, 'This is actual fraud')

      // Oracle verifies FAILURE (dispute was valid)
      await time.increaseTo((await escrow.endDate()) + 1n)
      await escrow.connect(oracle).verifyAndRelease(false, promptHash)

      // Disputer gets full amount back (no slash)
      await expect(escrow.connect(disputer).claimDisputeStake())
        .to.emit(escrow, 'DisputeReleased')
        .withArgs(campaignId, disputer.address, 20n * ONE_USDC)

      expect(await usdc.balanceOf(disputer.address)).to.equal(disputerInitial)
    })
  })

  describe('Scenario 4: Emergency Finalization (Oracle Timeout)', () => {
    it('should allow emergency finalization after grace period', async () => {
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(100n * ONE_USDC)
      await escrow.connect(voucher).vouch(30n * ONE_USDC)

      // Fast forward past end + grace period (30 days)
      const endDate = await escrow.endDate()
      await time.increaseTo(endDate + BigInt(30 * 24 * 60 * 60) + 1n)

      // Anyone can trigger emergency finalization
      await expect(escrow.connect(pledger1).emergencyFinalize())
        .to.emit(escrow, 'Verified')
        .withArgs(campaignId, false)

      expect(await escrow.status()).to.equal(3) // Status.Failed
      expect(await escrow.fraudFlagged()).to.equal(false) // No fraud flag on timeout

      // Pledger gets full refund
      await escrow.connect(pledger1).claimPledgeRefund()
      expect(await usdc.balanceOf(pledger1.address)).to.equal(1000n * ONE_USDC)

      // Voucher gets full amount back (no fraud flag = no slash)
      await escrow.connect(voucher).claimVoucher()
      expect(await usdc.balanceOf(voucher.address)).to.equal(100n * ONE_USDC)
    })
  })

  describe('Access Control', () => {
    it('should prevent non-oracle from calling verifyAndRelease', async () => {
      await escrow.connect(creator).approveCampaign()
      await time.increaseTo((await escrow.endDate()) + 1n)

      await expect(
        escrow.connect(creator).verifyAndRelease(true, promptHash),
      ).to.be.revertedWithCustomError(escrow, 'AccessControlUnauthorizedAccount')
    })

    it('should prevent non-creator from activating campaign', async () => {
      await expect(escrow.connect(pledger1).approveCampaign()).to.be.revertedWithCustomError(
        escrow,
        'AccessControlUnauthorizedAccount',
      )
    })

    it('should prevent non-creator from claiming creator funds', async () => {
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(100n * ONE_USDC)
      await time.increaseTo((await escrow.endDate()) + 1n)
      await escrow.connect(oracle).verifyAndRelease(true, promptHash)

      await expect(escrow.connect(pledger1).claimCreator()).to.be.revertedWith('Not creator')
    })

    it('should prevent non-treasury from claiming treasury funds', async () => {
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(100n * ONE_USDC)
      await time.increaseTo((await escrow.endDate()) + 1n)
      await escrow.connect(oracle).verifyAndRelease(true, promptHash)

      await expect(escrow.connect(creator).claimTreasury()).to.be.revertedWith('Not treasury')
    })
  })

  describe('Balance Invariants', () => {
    it('should never allow total claims to exceed contract balance', async () => {
      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger1).pledge(200n * ONE_USDC)
      await escrow.connect(pledger2).pledge(100n * ONE_USDC)
      await escrow.connect(voucher).vouch(50n * ONE_USDC)
      await escrow.connect(disputer).dispute(20n * ONE_USDC, 'test')

      await time.increaseTo((await escrow.endDate()) + 1n)
      await escrow.connect(oracle).verifyAndRelease(true, promptHash)

      // Calculate total claimable
      const creatorClaimable = await escrow.creatorClaimable()
      const treasuryClaimable = await escrow.treasuryClaimable()
      const voucherStake = await escrow.vouchers(voucher.address)
      const disputerStake = (20n * ONE_USDC) / 2n // 50% slashed

      const totalClaimable = creatorClaimable + treasuryClaimable + voucherStake + disputerStake
      const escrowBalance = await usdc.balanceOf(await escrow.getAddress())

      expect(totalClaimable).to.be.lte(escrowBalance)
    })
  })
})

describe('CampaignFactory Integration', () => {
  it('should track creator campaigns correctly', async () => {
    const [_admin, creator, oracle, treasury] = await ethers.getSigners()

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

    await usdc.mint(creator.address, 100n * ONE_USDC)
    await usdc.connect(creator).approve(await factory.getAddress(), 100n * ONE_USDC)

    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('Test prompt'))
    const endDate = (await time.latest()) + MIN_CAMPAIGN_DURATION + 3600

    // Create multiple campaigns
    await factory
      .connect(creator)
      .createCampaign(endDate, promptHash, 100n * ONE_USDC, MIN_BOND, false)
    await factory
      .connect(creator)
      .createCampaign(endDate, promptHash, 100n * ONE_USDC, MIN_BOND, false)

    // Verify tracking
    const campaigns = await factory.creatorCampaigns(creator.address, 0)
    expect(campaigns).to.equal(1n)

    const campaigns2 = await factory.creatorCampaigns(creator.address, 1)
    expect(campaigns2).to.equal(2n)
  })
})
