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
 * ERC20 ABI — includes read + approve for USDC interactions
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
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

/**
 * PledgeEscrow ABI — per-campaign escrow for pledges, vouches, and disputes
 * Matches PledgeEscrow.sol (Solidity 0.8.20)
 */
export const PLEDGE_ESCROW_ABI: Abi = [
  // Write functions
  {
    type: 'function',
    name: 'pledge',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'vouch',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'dispute',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimPledgeRefund',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimVoucher',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimDisputeStake',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'verifyAndRelease',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'success', type: 'bool' },
      { name: 'promptHash_', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimCreator',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimTreasury',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  // Read functions
  {
    type: 'function',
    name: 'pledges',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'vouchers',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'disputers',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'status',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'amountPledged',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalVouched',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalDisputed',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'finalized',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'outcomeSuccess',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'endDate',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'promptHash',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'creator',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'creatorClaimable',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    type: 'event',
    name: 'Pledged',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'pledger', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Vouched',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'voucher', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Disputed',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'disputer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'reason', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Verified',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'success', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsReleased',
    inputs: [
      { name: 'id', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'to', type: 'address', indexed: false },
    ],
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
