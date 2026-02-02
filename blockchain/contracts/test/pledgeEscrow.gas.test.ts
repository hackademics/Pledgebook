import { expect } from 'chai'
import { ethers } from 'hardhat'
import { setBalance, time } from '@nomicfoundation/hardhat-network-helpers'

const ONE_USDC = 1n * 10n ** 6n
const MIN_BOND = 10n * ONE_USDC
const PLEDGE_AMOUNT = 1n * ONE_USDC
const PLEDGER_COUNT = Number(process.env.GAS_PLEDGER_COUNT || '100')
const RUN_GAS_PROFILE = process.env.GAS_PROFILE === 'true'

const describeGas = RUN_GAS_PROFILE ? describe : describe.skip

describeGas('PledgeEscrow gas profiling', () => {
  it(`profiles gas for ${PLEDGER_COUNT} pledgers`, async () => {
    const [, creator, oracle, treasury, ...initialPledgers] = await ethers.getSigners()

    const MockUSDC = await ethers.getContractFactory('MockUSDC')
    const usdc = await MockUSDC.deploy()

    const MockAavePool = await ethers.getContractFactory('MockAavePool')
    const aavePool = await MockAavePool.deploy()

    const endDate = (await time.latest()) + 3600
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('prompt-gas'))

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
    await usdc.connect(creator).approve(await escrow.getAddress(), MIN_BOND)
    await escrow.connect(creator).approveCampaign()

    const pledgers = [...initialPledgers]
    while (pledgers.length < PLEDGER_COUNT) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider)
      pledgers.push(wallet)
    }

    for (const pledger of pledgers) {
      await setBalance(pledger.address, ethers.parseEther('1'))
      await usdc.mint(pledger.address, PLEDGE_AMOUNT)
      await usdc.connect(pledger).approve(await escrow.getAddress(), PLEDGE_AMOUNT)
    }

    const gasUsed: bigint[] = []
    for (const pledger of pledgers) {
      const tx = await escrow.connect(pledger).pledge(PLEDGE_AMOUNT)
      const receipt = await tx.wait()
      gasUsed.push(receipt?.gasUsed ?? 0n)
    }

    const total = gasUsed.reduce((sum, value) => sum + value, 0n)
    const average = total / BigInt(gasUsed.length)

    console.log(`Average gas per pledge (${gasUsed.length} pledgers): ${average.toString()}`)

    expect(gasUsed.length).to.equal(PLEDGER_COUNT)
  })
})
