// =============================================================================
// CHAIN CONFIGURATIONS
// Purpose: Define blockchain networks for the application
// =============================================================================

import { defineChain } from 'viem'

/**
 * Polygon Amoy Testnet Configuration
 * Chain ID: 80002
 * This is the recommended testnet for Polygon development
 */
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976CA11',
      blockCreated: 3127388,
    },
  },
  testnet: true,
})

/**
 * Polygon Mainnet Configuration (for future production use)
 */
export { polygon } from 'viem/chains'

/**
 * Supported chains for the application
 */
export const supportedChains = [polygonAmoy] as const

/**
 * Default chain for development
 */
export const defaultChain = polygonAmoy
