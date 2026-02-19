import type { Disputer, DisputerResponse, DisputerSummary, EvidenceItem } from './disputer.schema'
import { formatEther } from 'viem'

// =============================================================================
// DISPUTER MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Parse evidence JSON string to array
 */
function parseEvidence(evidence: string | EvidenceItem[]): EvidenceItem[] {
  if (Array.isArray(evidence)) return evidence
  try {
    return JSON.parse(evidence) as EvidenceItem[]
  } catch {
    return []
  }
}

/**
 * Maps a database row to the full API response format
 */
export function toDisputerResponse(row: Disputer, campaignSlug?: string): DisputerResponse {
  return {
    id: row.disputer_id,
    campaignId: row.campaign_id,
    ...(campaignSlug ? { campaignSlug } : {}),
    disputerAddress: row.disputer_address,
    amount: row.amount,
    status: row.status,
    reason: row.reason,
    disputeType: row.dispute_type,
    evidence: parseEvidence(row.evidence),
    stakeTxHash: row.stake_tx_hash,
    resolutionTxHash: row.resolution_tx_hash ?? null,
    blockNumber: row.block_number ?? null,
    blockTimestamp: row.block_timestamp ?? null,
    resolutionOutcome: row.resolution_outcome ?? null,
    resolutionNotes: row.resolution_notes ?? null,
    resolvedBy: row.resolved_by ?? null,
    resolvedAt: row.resolved_at ?? null,
    rewardEarned: row.reward_earned,
    stakeReturned: row.stake_returned,
    stakeSlashed: row.stake_slashed,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    disputedAt: row.disputed_at,
  }
}

/**
 * Maps a database row to summary format (for list views)
 */
export function toDisputerSummary(row: Disputer, campaignSlug?: string): DisputerSummary {
  return {
    id: row.disputer_id,
    campaignId: row.campaign_id,
    ...(campaignSlug ? { campaignSlug } : {}),
    disputerAddress: row.disputer_address,
    amount: row.amount,
    status: row.status,
    reason: row.reason,
    disputeType: row.dispute_type,
    disputedAt: row.disputed_at,
  }
}

/**
 * Maps multiple database rows to full API response format
 */
export function toDisputerResponseList(rows: Disputer[]): DisputerResponse[] {
  return rows.map((row) => toDisputerResponse(row))
}

/**
 * Maps multiple database rows to summary format
 */
export function toDisputerSummaryList(rows: Disputer[]): DisputerSummary[] {
  return rows.map((row) => toDisputerSummary(row))
}

/**
 * Format disputer amount for display (wei to ETH)
 */
export function formatDisputerAmount(weiAmount: string, decimals = 4): string {
  return Number(formatEther(BigInt(weiAmount))).toFixed(decimals)
}

/**
 * Get dispute type display name
 */
export function getDisputeTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    fraud: 'Fraud',
    misrepresentation: 'Misrepresentation',
    rule_violation: 'Rule Violation',
    verification_failure: 'Verification Failure',
    general: 'General',
  }
  return displayNames[type] || type
}
