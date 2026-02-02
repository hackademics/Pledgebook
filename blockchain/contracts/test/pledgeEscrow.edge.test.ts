import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import type { PledgeEscrow, MockUSDC, MockAavePool } from '../typechain-types'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

const MIN_BOND = 10n * 10n ** 6n
const ONE_USDC = 1n * 10n ** 6n
const MIN_CAMPAIGN_DURATION = 86400 // 1 day in seconds

describe('PledgeEscrow Edge Cases', () => {
  let usdc: MockUSDC
  let aavePool: MockAavePool
  let escrow: PledgeEscrow
  let creator: HardhatEthersSigner
  let oracle: HardhatEthersSigner
  let treasury: HardhatEthersSigner
  let pledgers: HardhatEthersSigner[]
  let promptHash: string
  let endDate: number

  async function deployEscrow(customEndDate?: number) {
    const signers = await ethers.getSigners()
    creator = signers[1]
    oracle = signers[2]
    treasury = signers[3]
    pledgers = signers.slice(4, 14) // 10 pledgers

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    aavePool = await MockAavePool.deploy()

    endDate = customEndDate ?? (await time.latest()) + MIN_CAMPAIGN_DURATION + 3600
    promptHash = ethers.keccak256(ethers.toUtf8Bytes('prompt'))

    const Escrow = await ethers.getContractFactory('PledgeEscrow')
    escrow = await Escrow.deploy(
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

    // Fund creator and transfer bond to escrow
    await usdc.mint(creator.address, MIN_BOND)
    await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)

    // Fund all pledgers
    for (const pledger of pledgers) {
      await usdc.mint(pledger.address, 100n * ONE_USDC)
      await usdc.connect(pledger).approve(await escrow.getAddress(), 100n * ONE_USDC)
    }

    return escrow
  }

  describe('Multiple pledgers claim refund', () => {
    it('should allow ALL pledgers to claim full refunds when campaign fails', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      // 10 pledgers each pledge different amounts
      const pledgeAmounts = [
        10n * ONE_USDC,
        25n * ONE_USDC,
        5n * ONE_USDC,
        50n * ONE_USDC,
        15n * ONE_USDC,
        30n * ONE_USDC,
        8n * ONE_USDC,
        12n * ONE_USDC,
        20n * ONE_USDC,
        7n * ONE_USDC,
      ]

      let totalPledged = 0n
      for (let i = 0; i < pledgers.length; i++) {
        await escrow.connect(pledgers[i]).pledge(pledgeAmounts[i])
        totalPledged += pledgeAmounts[i]
      }

      expect(await escrow.amountPledged()).to.equal(totalPledged)

      // Campaign fails
      await time.increaseTo(endDate + 1)
      await escrow.connect(oracle).verifyAndRelease(false, promptHash)

      // All pledgers claim refunds
      for (let i = 0; i < pledgers.length; i++) {
        const balanceBefore = await usdc.balanceOf(pledgers[i].address)
        await escrow.connect(pledgers[i]).claimPledgeRefund()
        const balanceAfter = await usdc.balanceOf(pledgers[i].address)

        expect(balanceAfter - balanceBefore).to.equal(
          pledgeAmounts[i],
          `Pledger ${i} did not receive full refund`,
        )
      }

      // Verify escrow has no pledger funds left (only creator bond for treasury)
      const escrowBalance = await usdc.balanceOf(await escrow.getAddress())
      expect(escrowBalance).to.equal(MIN_BOND) // Only creator bond remains for treasury
    })

    it('should handle pledgers claiming in random order', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      const pledgeAmount = 10n * ONE_USDC
      for (const pledger of pledgers) {
        await escrow.connect(pledger).pledge(pledgeAmount)
      }

      await time.increaseTo(endDate + 1)
      await escrow.connect(oracle).verifyAndRelease(false, promptHash)

      // Claim in reverse order
      for (let i = pledgers.length - 1; i >= 0; i--) {
        const balanceBefore = await usdc.balanceOf(pledgers[i].address)
        await escrow.connect(pledgers[i]).claimPledgeRefund()
        const balanceAfter = await usdc.balanceOf(pledgers[i].address)

        expect(balanceAfter - balanceBefore).to.equal(pledgeAmount)
      }
    })

    it('should prevent double-claiming refunds', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      await escrow.connect(pledgers[0]).pledge(10n * ONE_USDC)

      await time.increaseTo(endDate + 1)
      await escrow.connect(oracle).verifyAndRelease(false, promptHash)

      await escrow.connect(pledgers[0]).claimPledgeRefund()

      await expect(escrow.connect(pledgers[0]).claimPledgeRefund()).to.be.revertedWith(
        'Nothing to refund',
      )
    })
  })

  describe('Dispute threshold edge cases', () => {
    it('should NOT trigger dispute at exactly 10% threshold', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      // Pledge 100 USDC
      await escrow.connect(pledgers[0]).pledge(100n * ONE_USDC)

      // Fund disputer
      const disputer = pledgers[1]
      await usdc.mint(disputer.address, 10n * ONE_USDC)
      await usdc.connect(disputer).approve(await escrow.getAddress(), 10n * ONE_USDC)

      // Dispute exactly 10% (threshold is > 10%, not >=)
      await escrow.connect(disputer).dispute(10n * ONE_USDC, 'exactly threshold')

      expect(await escrow.isDisputed()).to.equal(false)
      expect(await escrow.status()).to.equal(1) // Active
    })

    it('should trigger dispute at 10% + 1 wei', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      // Pledge 100 USDC
      await escrow.connect(pledgers[0]).pledge(100n * ONE_USDC)

      // Fund disputer
      const disputer = pledgers[1]
      const disputeAmount = 10n * ONE_USDC + 1n // Just over threshold
      await usdc.mint(disputer.address, disputeAmount)
      await usdc.connect(disputer).approve(await escrow.getAddress(), disputeAmount)

      // Dispute just over 10%
      await escrow.connect(disputer).dispute(disputeAmount, 'over threshold')

      expect(await escrow.isDisputed()).to.equal(true)
      expect(await escrow.status()).to.equal(4) // Disputed
    })

    it('should calculate threshold correctly for large pledge amounts', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      // Pledge large amount (1 million USDC)
      const largePledge = 1_000_000n * ONE_USDC
      await usdc.mint(pledgers[0].address, largePledge)
      await usdc.connect(pledgers[0]).approve(await escrow.getAddress(), largePledge)
      await escrow.connect(pledgers[0]).pledge(largePledge)

      // Threshold is 10% = 100,000 USDC
      const disputer = pledgers[1]
      const threshold = 100_000n * ONE_USDC
      await usdc.mint(disputer.address, threshold + 1n)
      await usdc.connect(disputer).approve(await escrow.getAddress(), threshold + 1n)

      // Dispute just over threshold
      await escrow.connect(disputer).dispute(threshold + 1n, 'large amount')

      expect(await escrow.isDisputed()).to.equal(true)
    })
  })

  describe('Campaign duration edge cases', () => {
    it('should reject campaign with duration exactly at MIN_CAMPAIGN_DURATION', async () => {
      const signers = await ethers.getSigners()

      const MockUSDC = await ethers.getContractFactory('MockUSDC')
      const usdc = await MockUSDC.deploy()

      const MockAavePool = await ethers.getContractFactory('MockAavePool')
      const aavePool = await MockAavePool.deploy()

      const now = await time.latest()
      const exactMinEndDate = now + MIN_CAMPAIGN_DURATION // Exactly at minimum, not greater

      const Escrow = await ethers.getContractFactory('PledgeEscrow')

      await expect(
        Escrow.deploy(
          await usdc.getAddress(),
          await aavePool.getAddress(),
          signers[2].address,
          signers[3].address,
          signers[1].address,
          1,
          exactMinEndDate,
          ethers.keccak256(ethers.toUtf8Bytes('test')),
          100n * ONE_USDC,
          MIN_BOND,
          false,
        ),
      ).to.be.revertedWith('Campaign too short')
    })

    it('should accept campaign with duration just over MIN_CAMPAIGN_DURATION', async () => {
      const signers = await ethers.getSigners()

      const MockUSDC = await ethers.getContractFactory('MockUSDC')
      const usdc = await MockUSDC.deploy()

      const MockAavePool = await ethers.getContractFactory('MockAavePool')
      const aavePool = await MockAavePool.deploy()

      const now = await time.latest()
      const justOverMinEndDate = now + MIN_CAMPAIGN_DURATION + 60 // Add 60 second buffer for tx time

      const Escrow = await ethers.getContractFactory('PledgeEscrow')

      await expect(
        Escrow.deploy(
          await usdc.getAddress(),
          await aavePool.getAddress(),
          signers[2].address,
          signers[3].address,
          signers[1].address,
          1,
          justOverMinEndDate,
          ethers.keccak256(ethers.toUtf8Bytes('test')),
          100n * ONE_USDC,
          MIN_BOND,
          false,
        ),
      ).to.not.be.reverted
    })
  })

  describe('Minimum pledge amount edge cases', () => {
    it('should reject pledge below MIN_PLEDGE', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      await expect(escrow.connect(pledgers[0]).pledge(ONE_USDC - 1n)).to.be.revertedWith(
        'Pledge too small',
      )
    })

    it('should accept pledge exactly at MIN_PLEDGE', async () => {
      await deployEscrow()
      await escrow.connect(creator).approveCampaign()

      await expect(escrow.connect(pledgers[0]).pledge(ONE_USDC)).to.emit(escrow, 'Pledged')
    })
  })
})

describe('PledgeEscrow Invariant Tests', () => {
  it('should maintain invariant: total claimable never exceeds balance (success)', async () => {
    const [, creator, pledger, voucher, disputer, oracle, treasury] = await ethers.getSigners()

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    const usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    const endDate = (await time.latest()) + 86400 + 3600
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('invariant'))

    const Escrow = await ethers.getContractFactory('PledgeEscrow')
    const escrow = await Escrow.deploy(
      await usdc.getAddress(),
      await aavePool.getAddress(),
      oracle.address,
      treasury.address,
      creator.address,
      1,
      endDate,
      promptHash,
      100n * ONE_USDC,
      MIN_BOND,
      false,
    )

    await usdc.mint(creator.address, MIN_BOND)
    await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)

    await usdc.mint(pledger.address, 100n * ONE_USDC)
    await usdc.connect(pledger).approve(await escrow.getAddress(), 100n * ONE_USDC)

    await usdc.mint(voucher.address, 20n * ONE_USDC)
    await usdc.connect(voucher).approve(await escrow.getAddress(), 20n * ONE_USDC)

    await usdc.mint(disputer.address, 5n * ONE_USDC)
    await usdc.connect(disputer).approve(await escrow.getAddress(), 5n * ONE_USDC)

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)
    await escrow.connect(voucher).vouch(20n * ONE_USDC)
    await escrow.connect(disputer).dispute(5n * ONE_USDC, 'test')

    await time.increaseTo(endDate + 1)
    await escrow.connect(oracle).verifyAndRelease(true, promptHash)

    // Calculate total claimable
    const creatorClaimable = await escrow.creatorClaimable()

    // All vouchers get full refund on success
    const voucherClaimable = await escrow.vouchers(voucher.address)

    // Disputers get 50% slashed on success (frivolous dispute)
    const disputerStake = await escrow.disputers(disputer.address)

    // Escrow balance should be sufficient for all claims
    const escrowBalance = await usdc.balanceOf(await escrow.getAddress())

    // Note: We compare total possible claims vs balance
    // Disputer claim is stake - 50% slash = stake * 0.5
    const disputerClaimAfterSlash = disputerStake / 2n

    // Total claimable should not exceed balance (allowing for yield which goes to treasury)
    expect(escrowBalance).to.be.gte(
      creatorClaimable + voucherClaimable + disputerClaimAfterSlash,
      'Escrow balance insufficient for claims',
    )
  })

  it('should maintain invariant: total claimable never exceeds balance (failure)', async () => {
    const [, creator, pledger, voucher, disputer, oracle, treasury] = await ethers.getSigners()

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    const usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    const endDate = (await time.latest()) + 86400 + 3600
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('invariant-fail'))

    const Escrow = await ethers.getContractFactory('PledgeEscrow')
    const escrow = await Escrow.deploy(
      await usdc.getAddress(),
      await aavePool.getAddress(),
      oracle.address,
      treasury.address,
      creator.address,
      1,
      endDate,
      promptHash,
      100n * ONE_USDC,
      MIN_BOND,
      false,
    )

    await usdc.mint(creator.address, MIN_BOND)
    await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)

    await usdc.mint(pledger.address, 100n * ONE_USDC)
    await usdc.connect(pledger).approve(await escrow.getAddress(), 100n * ONE_USDC)

    await usdc.mint(voucher.address, 20n * ONE_USDC)
    await usdc.connect(voucher).approve(await escrow.getAddress(), 20n * ONE_USDC)

    await usdc.mint(disputer.address, 5n * ONE_USDC)
    await usdc.connect(disputer).approve(await escrow.getAddress(), 5n * ONE_USDC)

    await escrow.connect(creator).approveCampaign()
    await escrow.connect(pledger).pledge(100n * ONE_USDC)
    await escrow.connect(voucher).vouch(20n * ONE_USDC)
    await escrow.connect(disputer).dispute(5n * ONE_USDC, 'test')

    await time.increaseTo(endDate + 1)
    await escrow.connect(oracle).verifyAndRelease(false, promptHash)

    // On failure:
    // - Pledgers get full refund
    // - Vouchers get 50% slashed (backed fraud)
    // - Disputers get full refund (valid dispute)
    // - Treasury gets: creator bond + yield + 50% of voucher stakes

    const pledgerClaimable = await escrow.pledges(pledger.address)
    const voucherStake = 20n * ONE_USDC
    const voucherClaimable = voucherStake / 2n // 50% slashed
    const disputerClaimable = await escrow.disputers(disputer.address)

    const escrowBalance = await usdc.balanceOf(await escrow.getAddress())

    // Verify all claims can be fulfilled
    const totalNonTreasuryClaims = pledgerClaimable + voucherClaimable + disputerClaimable
    expect(escrowBalance).to.be.gte(
      totalNonTreasuryClaims,
      'Escrow balance insufficient for non-treasury claims',
    )

    // Actually claim everything and verify it works
    await escrow.connect(pledger).claimPledgeRefund()
    await escrow.connect(voucher).claimVoucher()
    await escrow.connect(disputer).claimDisputeStake()
    await escrow.connect(treasury).claimTreasury()

    // After all claims, escrow should be empty
    const finalBalance = await usdc.balanceOf(await escrow.getAddress())
    expect(finalBalance).to.equal(0n, 'Escrow should be empty after all claims')
  })
})

describe('PledgeEscrow Fuzz-like Tests', () => {
  it('should handle various pledge amounts correctly', async () => {
    const amounts = [
      1n * ONE_USDC, // Minimum
      5n * ONE_USDC,
      10n * ONE_USDC,
      100n * ONE_USDC,
      1000n * ONE_USDC,
      10000n * ONE_USDC,
      99999n * ONE_USDC, // Large odd number
    ]

    for (const amount of amounts) {
      const [, creator, pledger, oracle, treasury] = await ethers.getSigners()

      const MockUSDC = await ethers.getContractFactory('MockUSDC')
      const usdc = await MockUSDC.deploy()

      const MockAavePool = await ethers.getContractFactory('MockAavePool')
      const aavePool = await MockAavePool.deploy()

      const endDate = (await time.latest()) + 86400 + 3600
      const promptHash = ethers.keccak256(ethers.toUtf8Bytes(`fuzz-${amount}`))

      const Escrow = await ethers.getContractFactory('PledgeEscrow')
      const escrow = await Escrow.deploy(
        await usdc.getAddress(),
        await aavePool.getAddress(),
        oracle.address,
        treasury.address,
        creator.address,
        1,
        endDate,
        promptHash,
        amount,
        MIN_BOND,
        false,
      )

      await usdc.mint(creator.address, MIN_BOND)
      await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)

      await usdc.mint(pledger.address, amount)
      await usdc.connect(pledger).approve(await escrow.getAddress(), amount)

      await escrow.connect(creator).approveCampaign()
      await escrow.connect(pledger).pledge(amount)

      expect(await escrow.amountPledged()).to.equal(amount)
      expect(await escrow.pledges(pledger.address)).to.equal(amount)
    }
  })

  it('should handle pledge timing correctly', async () => {
    const [, creator, pledger, oracle, treasury] = await ethers.getSigners()

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    const usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    const duration = 86400 + 3600 // 1 day + 1 hour
    const endDate = (await time.latest()) + duration
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('timing'))

    const Escrow = await ethers.getContractFactory('PledgeEscrow')
    const escrow = await Escrow.deploy(
      await usdc.getAddress(),
      await aavePool.getAddress(),
      oracle.address,
      treasury.address,
      creator.address,
      1,
      endDate,
      promptHash,
      100n * ONE_USDC,
      MIN_BOND,
      false,
    )

    await usdc.mint(creator.address, MIN_BOND)
    await usdc.connect(creator).transfer(await escrow.getAddress(), MIN_BOND)
    await escrow.connect(creator).approveCampaign()

    await usdc.mint(pledger.address, 100n * ONE_USDC)
    await usdc.connect(pledger).approve(await escrow.getAddress(), 100n * ONE_USDC)

    // Pledge at start
    await escrow.connect(pledger).pledge(10n * ONE_USDC)

    // Pledge near middle
    await time.increase(duration / 2)
    await escrow.connect(pledger).pledge(10n * ONE_USDC)

    // Pledge near end (a few seconds before to account for block time)
    await time.increaseTo(endDate - 5)
    await escrow.connect(pledger).pledge(10n * ONE_USDC)

    // Pledge at or after deadline should fail
    await time.increaseTo(endDate + 1)
    await expect(escrow.connect(pledger).pledge(10n * ONE_USDC)).to.be.revertedWith('Past deadline')
  })
})
