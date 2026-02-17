/**
 * Voucher domain types for the frontend
 */

/**
 * Voucher status enum
 */
export type VoucherStatus = 'pending' | 'active' | 'released' | 'slashed' | 'withdrawn' | 'expired'

/**
 * Full voucher response from API
 */
export interface VoucherResponse {
  id: string
  campaignId: string
  campaignSlug?: string
  voucherAddress: string
  amount: string
  status: VoucherStatus
  endorsementMessage: string | null
  stakeTxHash: string
  releaseTxHash: string | null
  slashTxHash: string | null
  blockNumber: number | null
  blockTimestamp: string | null
  rewardEarned: string
  rewardClaimed: string
  rewardClaimedAt: string | null
  slashAmount: string
  slashReason: string | null
  slashedAt: string | null
  expiresAt: string | null
  createdAt: string
  vouchedAt: string
  releasedAt: string | null
  withdrawnAt: string | null
}

/**
 * Voucher summary for lists
 */
export interface VoucherSummary {
  id: string
  campaignId: string
  voucherAddress: string
  amount: string
  status: VoucherStatus
  endorsementMessage: string | null
  vouchedAt: string
  // Extended fields from join with campaigns
  campaignTitle?: string
  campaignStatus?: string
  campaignSlug?: string
}

/**
 * Input for creating a voucher
 */
export interface CreateVoucherInput {
  campaignId: string
  amount: string
  stakeTxHash: string
  endorsementMessage?: string | null
  blockNumber?: number
  blockTimestamp?: string
  expiresAt?: string | null
}

/**
 * Input for updating a voucher
 */
export interface UpdateVoucherInput {
  status?: VoucherStatus
  releaseTxHash?: string
  slashTxHash?: string
  slashAmount?: string
  slashReason?: string
  rewardEarned?: string
}

/**
 * Voucher form state for modal
 */
export interface VoucherFormState {
  amount: string
  endorsementMessage: string
  expiresAt: string
}

/**
 * Status badge configuration
 */
export interface VoucherStatusConfig {
  label: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  icon: string
}

/**
 * Get status configuration for display
 */
export function getVoucherStatusConfig(status: VoucherStatus): VoucherStatusConfig {
  const configs: Record<VoucherStatus, VoucherStatusConfig> = {
    pending: {
      label: 'Pending',
      color: 'warning',
      icon: 'heroicons:clock',
    },
    active: {
      label: 'Active',
      color: 'success',
      icon: 'heroicons:shield-check',
    },
    released: {
      label: 'Released',
      color: 'success',
      icon: 'heroicons:check-circle',
    },
    slashed: {
      label: 'Slashed',
      color: 'error',
      icon: 'heroicons:exclamation-triangle',
    },
    withdrawn: {
      label: 'Withdrawn',
      color: 'neutral',
      icon: 'heroicons:arrow-uturn-left',
    },
    expired: {
      label: 'Expired',
      color: 'neutral',
      icon: 'heroicons:clock',
    },
  }
  return configs[status]
}

// Re-export shared currency utilities for backwards compatibility
export {
  formatUsdcAmount as formatVoucherAmount,
  parseUsdcToWei as parseVoucherAmountToWei,
} from '~/utils/currency'

/**
 * Check if voucher is in a final state
 */
export function isVoucherFinal(status: VoucherStatus): boolean {
  return ['released', 'slashed', 'withdrawn', 'expired'].includes(status)
}

/**
 * Get voucher action availability
 */
export function getVoucherActions(status: VoucherStatus): {
  canWithdraw: boolean
  canRelease: boolean
  canSlash: boolean
} {
  return {
    canWithdraw: status === 'pending',
    canRelease: status === 'active',
    canSlash: status === 'active',
  }
}
