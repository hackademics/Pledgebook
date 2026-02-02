import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  impersonateAccount,
  setBalance,
  stopImpersonatingAccount,
  time,
} from '@nomicfoundation/hardhat-network-helpers'

const ONE_USDC = 1n * 10n ** 6n
const MIN_BOND = 10n * ONE_USDC

const RUN_FORK_TESTS = Boolean(process.env.POLYGON_RPC_URL)
const POLYGON_USDC_ADDRESS =
  process.env.POLYGON_USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
const POLYGON_AAVE_POOL_ADDRESS =
  process.env.POLYGON_AAVE_POOL_ADDRESS || '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
const POLYGON_USDC_WHALE = process.env.POLYGON_USDC_WHALE || POLYGON_AAVE_POOL_ADDRESS

const AAVE_POOL_ABI = [
  'function getReserveData(address asset) view returns (uint256,uint128,uint128,uint128,uint128,uint128,uint40,uint16,address,address,address,address,uint128,uint128,uint128)',
]

const describeFork = RUN_FORK_TESTS ? describe : describe.skip

describeFork('PledgeEscrow (fork)', () => {
  it('deposits to Aave and withdraws on verify', async () => {
    const [, creator, pledger, oracle, treasury] = await ethers.getSigners()

    const usdc = await ethers.getContractAt('IERC20', POLYGON_USDC_ADDRESS)

    await impersonateAccount(POLYGON_USDC_WHALE)
    await setBalance(POLYGON_USDC_WHALE, ethers.parseEther('10'))
    const whaleSigner = await ethers.getSigner(POLYGON_USDC_WHALE)

    await usdc.connect(whaleSigner).transfer(creator.address, MIN_BOND)
    await usdc.connect(whaleSigner).transfer(pledger.address, 100n * ONE_USDC)

    await stopImpersonatingAccount(POLYGON_USDC_WHALE)

    const endDate = (await time.latest()) + 3600
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes('prompt-fork'))

    const Escrow = await ethers.getContractFactory('PledgeEscrow')
    const escrow = await Escrow.deploy(
      POLYGON_USDC_ADDRESS,
      POLYGON_AAVE_POOL_ADDRESS,
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

    await usdc.connect(creator).approve(await escrow.getAddress(), MIN_BOND)
    await usdc.connect(pledger).approve(await escrow.getAddress(), 100n * ONE_USDC)

    const pool = new ethers.Contract(POLYGON_AAVE_POOL_ADDRESS, AAVE_POOL_ABI, ethers.provider)
    const reserveData = await pool.getReserveData(POLYGON_USDC_ADDRESS)
    const aTokenAddress = reserveData[8]
    const aToken = await ethers.getContractAt('IERC20', aTokenAddress)

    await escrow.connect(creator).approveCampaign()

    const aTokenAfterBond = await aToken.balanceOf(await escrow.getAddress())
    expect(aTokenAfterBond).to.be.gt(0n)

    await escrow.connect(pledger).pledge(100n * ONE_USDC)

    const aTokenAfterPledge = await aToken.balanceOf(await escrow.getAddress())
    expect(aTokenAfterPledge).to.be.gt(aTokenAfterBond)

    await time.increaseTo((await escrow.endDate()) + 1)

    await expect(escrow.connect(oracle).verifyAndRelease(true, promptHash)).to.emit(
      escrow,
      'Verified',
    )

    const aTokenAfterWithdraw = await aToken.balanceOf(await escrow.getAddress())
    expect(aTokenAfterWithdraw).to.equal(0n)
  })
})
