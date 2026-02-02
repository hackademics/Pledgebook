/**
 * Pledge domain types for the frontend
 */

/**
 * Pledge status enum
 */
export type PledgeStatus = 'pending' | 'confirmed' | 'active' | 'released' | 'refunded' | 'failed'

/**
 * Full pledge response from API
 */
export interface PledgeResponse {
  id: string
  campaignId: string
  pledgerAddress: string
  amount: string
  message: string | null
  status: PledgeStatus
  txHash: string
  blockNumber: number | null
  blockTimestamp: string | null
  confirmations: number
  confirmedAt: string | null
  releaseTxHash: string | null
  refundTxHash: string | null
  releasedAt: string | null
  refundedAt: string | null
  yieldEarned: string
  yieldClaimed: string
  isAnonymous: boolean
  createdAt: string
  pledgedAt: string
}

/**
 * Pledge summary for lists
 */
export interface PledgeSummary {
  id: string
  campaignId: string
  pledgerAddress: string
  amount: string
  status: PledgeStatus
  isAnonymous: boolean
  pledgedAt: string
  // Extended fields from join with users
  pledgerName?: string
  pledgerAvatar?: string
}

/**
 * Input for creating a pledge
 */
export interface CreatePledgeInput {
  campaignId: string
  amount: string
  txHash: string
  message?: string | null
  isAnonymous?: boolean
  blockNumber?: number
  blockTimestamp?: string
}

/**
 * Pledge form state for modal
 */
export interface PledgeFormState {
  amount: string
  message: string
  isAnonymous: boolean
}

/**
 * Status badge configuration
 */
export interface PledgeStatusConfig {
  label: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  icon: string
}

/**
 * Get status configuration for display
 */
export function getPledgeStatusConfig(status: PledgeStatus): PledgeStatusConfig {
  const configs: Record<PledgeStatus, PledgeStatusConfig> = {
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: 'heroicons:clock',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'info',
      icon: 'heroicons:check',
    },
    active: {
      label: 'Active',
      color: 'success',
      icon: 'heroicons:bolt',
    },
    released: {
      label: 'Released',
      color: 'success',
      icon: 'heroicons:banknotes',
    },
    refunded: {
      label: 'Refunded',
      color: 'neutral',
      icon: 'heroicons:arrow-uturn-left',
    },
    failed: {
      label: 'Failed',
      color: 'error',
      icon: 'heroicons:x-circle',
    },
  }
  return configs[status]
}

/**
 * Format wei amount to human readable string
 */
export function formatPledgeAmount(weiAmount: string, decimals = 2): string {
  const wei = BigInt(weiAmount)
  const usdc = Number(wei) / 1_000_000 // USDC has 6 decimals
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(usdc)
}

/**
 * Parse human readable amount to wei string
 */
export function parseAmountToWei(amount: string): string {
  const cleaned = amount.replace(/[^0-9.]/g, '')
  const num = Number.parseFloat(cleaned) || 0
  const wei = Math.floor(num * 1_000_000) // USDC has 6 decimals
  return wei.toString()
}
