/**
 * Disputer domain types for the frontend
 */

/**
 * Disputer status enum
 */
export type DisputerStatus = 'pending' | 'active' | 'upheld' | 'rejected' | 'withdrawn' | 'expired'

/**
 * Dispute type enum
 */
export type DisputeType =
  | 'fraud'
  | 'misrepresentation'
  | 'rule_violation'
  | 'verification_failure'
  | 'general'

/**
 * Resolution outcome enum
 */
export type ResolutionOutcome = 'upheld' | 'rejected' | 'partial'

/**
 * Evidence item type
 */
export interface EvidenceItem {
  type: 'url' | 'text' | 'image' | 'document'
  content: string
  description?: string
  submittedAt?: string
}

/**
 * Full disputer response from API
 */
export interface DisputerResponse {
  id: string
  campaignId: string
  disputerAddress: string
  amount: string
  status: DisputerStatus
  reason: string
  disputeType: DisputeType
  evidence: EvidenceItem[]
  stakeTxHash: string
  resolutionTxHash: string | null
  blockNumber: number | null
  blockTimestamp: string | null
  resolutionOutcome: ResolutionOutcome | null
  resolutionNotes: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  rewardEarned: string
  stakeReturned: string
  stakeSlashed: string
  expiresAt: string | null
  createdAt: string
  disputedAt: string
}

/**
 * Disputer summary for lists
 */
export interface DisputerSummary {
  id: string
  campaignId: string
  disputerAddress: string
  amount: string
  status: DisputerStatus
  reason: string
  disputeType: DisputeType
  disputedAt: string
  // Extended fields from join with campaigns
  campaignTitle?: string
  campaignStatus?: string
}

/**
 * Input for creating a dispute
 */
export interface CreateDisputerInput {
  campaignId: string
  amount: string
  stakeTxHash: string
  reason: string
  disputeType?: DisputeType
  evidence?: EvidenceItem[]
  blockNumber?: number
  blockTimestamp?: string
  expiresAt?: string | null
}

/**
 * Input for updating a dispute
 */
export interface UpdateDisputerInput {
  status?: DisputerStatus
  evidence?: EvidenceItem[]
}

/**
 * Input for resolving a dispute
 */
export interface ResolveDisputerInput {
  outcome: ResolutionOutcome
  resolutionTxHash?: string
  notes?: string
  rewardEarned?: string
  stakeReturned?: string
  stakeSlashed?: string
}

/**
 * Disputer form state for modal
 */
export interface DisputerFormState {
  amount: string
  reason: string
  disputeType: DisputeType
  evidence: EvidenceItem[]
}

/**
 * Status badge configuration
 */
export interface DisputerStatusConfig {
  label: string
  color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  icon: string
}

/**
 * Get status configuration for display
 */
export function getDisputerStatusConfig(status: DisputerStatus): DisputerStatusConfig {
  const configs: Record<DisputerStatus, DisputerStatusConfig> = {
    pending: {
      label: 'Pending Review',
      color: 'warning',
      icon: 'heroicons:clock',
    },
    active: {
      label: 'Under Investigation',
      color: 'info',
      icon: 'heroicons:magnifying-glass',
    },
    upheld: {
      label: 'Upheld',
      color: 'success',
      icon: 'heroicons:check-circle',
    },
    rejected: {
      label: 'Rejected',
      color: 'error',
      icon: 'heroicons:x-circle',
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

/**
 * Get dispute type configuration for display
 */
export interface DisputeTypeConfig {
  label: string
  description: string
  icon: string
  color: 'error' | 'warning' | 'info'
}

export function getDisputeTypeConfig(type: DisputeType): DisputeTypeConfig {
  const configs: Record<DisputeType, DisputeTypeConfig> = {
    fraud: {
      label: 'Fraud',
      description: 'Campaign is intentionally deceptive',
      icon: 'heroicons:exclamation-triangle',
      color: 'error',
    },
    misrepresentation: {
      label: 'Misrepresentation',
      description: 'Facts or claims are misleading',
      icon: 'heroicons:document-magnifying-glass',
      color: 'warning',
    },
    rule_violation: {
      label: 'Rule Violation',
      description: 'Campaign violates platform rules',
      icon: 'heroicons:shield-exclamation',
      color: 'warning',
    },
    verification_failure: {
      label: 'Verification Failure',
      description: 'Unable to verify campaign claims',
      icon: 'heroicons:question-mark-circle',
      color: 'info',
    },
    general: {
      label: 'General Concern',
      description: 'Other concerns about campaign',
      icon: 'heroicons:flag',
      color: 'info',
    },
  }
  return configs[type]
}

/**
 * Format wei amount to human readable string
 */
export function formatDisputerAmount(weiAmount: string, decimals = 2): string {
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
export function parseDisputerAmountToWei(amount: string): string {
  const cleaned = amount.replace(/[^0-9.]/g, '')
  const num = Number.parseFloat(cleaned) || 0
  const wei = Math.floor(num * 1_000_000) // USDC has 6 decimals
  return wei.toString()
}

/**
 * Check if dispute is in a final state
 */
export function isDisputerFinal(status: DisputerStatus): boolean {
  return ['upheld', 'rejected', 'withdrawn', 'expired'].includes(status)
}

/**
 * Get dispute action availability
 */
export function getDisputerActions(status: DisputerStatus): {
  canWithdraw: boolean
  canAddEvidence: boolean
  canResolve: boolean
} {
  return {
    canWithdraw: status === 'pending',
    canAddEvidence: ['pending', 'active'].includes(status),
    canResolve: ['pending', 'active'].includes(status),
  }
}
