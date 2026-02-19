/**
 * Oracle Utility - Server-side blockchain interactions
 *
 * This module handles oracle operations for the PledgeEscrow contract.
 * Uses a server-side private key to sign transactions with ORACLE_ROLE.
 *
 * SECURITY: Private key must be kept secure and never exposed to client.
 */

import { createPublicClient, createWalletClient, http, type Address, type Hash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'
import { polygonAmoy } from '../../app/config/chains'

/**
 * PledgeEscrow ABI - verifyAndRelease function only
 * Full ABI is in app/config/contracts.ts
 */
const VERIFY_AND_RELEASE_ABI = [
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
    name: 'status',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
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
] as const

/**
 * Contract status enum (matches Solidity)
 */
export enum EscrowStatus {
  Draft = 0,
  Active = 1,
  Complete = 2,
  Failed = 3,
  Disputed = 4,
}

/**
 * Get chain configuration based on environment
 */
function getChain() {
  const chainId = Number.parseInt(process.env.NUXT_PUBLIC_CHAIN_ID || '80002', 10)
  return chainId === 137 ? polygon : polygonAmoy
}

/**
 * Get RPC URL for the current chain
 */
function getRpcUrl(): string {
  const chainId = Number.parseInt(process.env.NUXT_PUBLIC_CHAIN_ID || '80002', 10)
  if (chainId === 137) {
    return process.env.NUXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'
  }
  return process.env.NUXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology'
}

/**
 * Create a public client for read operations
 */
function createReadClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(getRpcUrl()),
  })
}

/**
 * Create a wallet client for write operations (oracle)
 */
function createOracleClient() {
  const privateKey = process.env.NUXT_ORACLE_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('NUXT_ORACLE_PRIVATE_KEY not configured')
  }

  // Ensure the key is properly formatted
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const account = privateKeyToAccount(formattedKey as `0x${string}`)

  return createWalletClient({
    account,
    chain: getChain(),
    transport: http(getRpcUrl()),
  })
}

/**
 * Read contract state before calling verifyAndRelease
 */
export interface EscrowState {
  status: EscrowStatus
  finalized: boolean
  endDate: bigint
  promptHash: `0x${string}`
}

/**
 * Get the current state of an escrow contract
 */
export async function getEscrowState(escrowAddress: Address): Promise<EscrowState> {
  const client = createReadClient()

  const [status, finalized, endDate, promptHash] = await Promise.all([
    client.readContract({
      address: escrowAddress,
      abi: VERIFY_AND_RELEASE_ABI,
      functionName: 'status',
    }),
    client.readContract({
      address: escrowAddress,
      abi: VERIFY_AND_RELEASE_ABI,
      functionName: 'finalized',
    }),
    client.readContract({
      address: escrowAddress,
      abi: VERIFY_AND_RELEASE_ABI,
      functionName: 'endDate',
    }),
    client.readContract({
      address: escrowAddress,
      abi: VERIFY_AND_RELEASE_ABI,
      functionName: 'promptHash',
    }),
  ])

  return {
    status: status as EscrowStatus,
    finalized: finalized as boolean,
    endDate: endDate as bigint,
    promptHash: promptHash as `0x${string}`,
  }
}

/**
 * Result of the oracle verification call
 */
export interface OracleResult {
  success: boolean
  transactionHash?: Hash
  error?: string
  skipped?: boolean
  skipReason?: string
}

/**
 * Call verifyAndRelease on the PledgeEscrow contract
 *
 * @param escrowAddress - Address of the PledgeEscrow contract
 * @param verificationSuccess - Whether the pledge was verified successfully
 * @param promptHash - The campaign's prompt hash (must match contract)
 * @returns Transaction result
 */
export async function callVerifyAndRelease(
  escrowAddress: Address,
  verificationSuccess: boolean,
  promptHash: `0x${string}`,
): Promise<OracleResult> {
  try {
    // Pre-flight checks
    const state = await getEscrowState(escrowAddress)

    // Check if already finalized
    if (state.finalized) {
      return {
        success: true,
        skipped: true,
        skipReason: 'Contract already finalized',
      }
    }

    // Check status is Active or Disputed
    if (state.status !== EscrowStatus.Active && state.status !== EscrowStatus.Disputed) {
      return {
        success: false,
        skipped: true,
        skipReason: `Invalid contract status: ${EscrowStatus[state.status]}`,
      }
    }

    // Check campaign has ended
    const now = BigInt(Math.floor(Date.now() / 1000))
    if (now < state.endDate) {
      return {
        success: false,
        skipped: true,
        skipReason: `Campaign not ended yet. Ends at ${new Date(Number(state.endDate) * 1000).toISOString()}`,
      }
    }

    // Verify prompt hash matches
    if (state.promptHash.toLowerCase() !== promptHash.toLowerCase()) {
      return {
        success: false,
        error: `Prompt hash mismatch. Contract: ${state.promptHash}, Provided: ${promptHash}`,
      }
    }

    // Create oracle wallet client
    const walletClient = createOracleClient()
    const publicClient = createReadClient()

    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: escrowAddress,
      abi: VERIFY_AND_RELEASE_ABI,
      functionName: 'verifyAndRelease',
      args: [verificationSuccess, promptHash],
      account: walletClient.account,
    })

    // Execute the transaction
    const hash = await walletClient.writeContract(request)

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    })

    return {
      success: receipt.status === 'success',
      transactionHash: hash,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Get the oracle wallet address (for verification/debugging)
 */
export function getOracleAddress(): Address | null {
  const privateKey = process.env.NUXT_ORACLE_PRIVATE_KEY
  if (!privateKey) {
    return null
  }

  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
  const account = privateKeyToAccount(formattedKey as `0x${string}`)
  return account.address
}
