import * as dotenv from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'solidity-coverage'

dotenv.config()

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || ''
const MNEMONIC = process.env.DEPLOYER_MNEMONIC || ''
const MNEMONIC_PATH = process.env.DEPLOYER_MNEMONIC_PATH || "m/44'/60'/0'/0"
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || ''
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || ''
const POLYGON_FORK_BLOCK = process.env.POLYGON_FORK_BLOCK || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''

const accounts = PRIVATE_KEY
  ? [PRIVATE_KEY]
  : MNEMONIC
    ? {
        mnemonic: MNEMONIC,
        path: MNEMONIC_PATH,
      }
    : []

const hardhatForking = POLYGON_RPC_URL
  ? {
      url: POLYGON_RPC_URL,
      blockNumber: POLYGON_FORK_BLOCK ? Number(POLYGON_FORK_BLOCK) : undefined,
    }
  : undefined

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      metadata: {
        bytecodeHash: 'ipfs',
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      ...(hardhatForking ? { forking: hardhatForking } : {}),
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    polygon: {
      url: POLYGON_RPC_URL,
      chainId: 137,
      accounts,
    },
    polygonAmoy: {
      url: POLYGON_AMOY_RPC_URL,
      chainId: 80002,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygon: ETHERSCAN_API_KEY,
      polygonAmoy: ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}

export default config
