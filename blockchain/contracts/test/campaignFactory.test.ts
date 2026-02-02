import { expect } from 'chai'
import { ethers } from 'hardhat'

const MIN_BOND = 10n * 10n ** 6n

describe('CampaignFactory', () => {
  it('creates a campaign escrow', async () => {
    const [, creator, oracle, treasury] = await ethers.getSigners()

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    const usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    const Factory = await ethers.getContractFactory('CampaignFactory')
    const factory = await Factory.deploy(
      await usdc.getAddress(),
      await aavePool.getAddress(),
      await oracle.getAddress(),
      await treasury.getAddress(),
    )

    await usdc.mint(creator.address, MIN_BOND)
    await usdc.connect(creator).approve(await factory.getAddress(), MIN_BOND)

    const MIN_CAMPAIGN_DURATION = 86400 // 1 day in seconds
    const endDate = Math.floor(Date.now() / 1000) + MIN_CAMPAIGN_DURATION + 3600
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('prompt'))

    await expect(
      factory.connect(creator).createCampaign(endDate, promptHash, 0, MIN_BOND, false),
    ).to.emit(factory, 'CampaignCreated')

    const escrow = await factory.campaignEscrows(1)
    expect(escrow).to.not.equal(ethers.ZeroAddress)
  })
})
