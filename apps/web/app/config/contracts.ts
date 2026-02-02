// =============================================================================
// CONTRACT CONFIGURATIONS
// Purpose: Define smart contract addresses and ABIs for the application
// =============================================================================

import type { Abi, Address } from 'viem'

/**
 * USDC Contract Configuration for Polygon Amoy Testnet
 * Note: This is a test USDC contract on Amoy testnet
 * You can get test USDC from: https://faucet.circle.com/
 */
export const USDC_ADDRESS_AMOY: Address = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'

/**
 * USDC Contract Configuration for Polygon Mainnet
 */
export const USDC_ADDRESS_POLYGON: Address = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'

/**
 * Minimal ERC20 ABI for balance reading
 * Only includes the functions we need to reduce bundle size
 */
export const ERC20_ABI: Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

/**
 * Get USDC address based on chain ID
 */
export function getUsdcAddress(chainId: number): Address {
  switch (chainId) {
    case 80002: // Polygon Amoy
      return USDC_ADDRESS_AMOY
    case 137: // Polygon Mainnet
      return USDC_ADDRESS_POLYGON
    default:
      return USDC_ADDRESS_AMOY // Default to testnet
  }
}
