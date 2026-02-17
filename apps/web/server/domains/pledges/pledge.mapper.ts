import type { Pledge, PledgeResponse, PledgeSummary } from './pledge.schema'
import { formatEther } from 'viem'

// =============================================================================
// PLEDGE MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Maps a database row to the full API response format
 */
export function toPledgeResponse(row: Pledge): PledgeResponse {
  return {
    id: row.pledge_id,
    campaignId: row.campaign_id,
    pledgerAddress: row.is_anonymous
      ? '0x0000000000000000000000000000000000000000'
      : row.pledger_address,
    amount: row.amount,
    message: row.message ?? null,
    status: row.status,
    txHash: row.tx_hash,
    blockNumber: row.block_number ?? null,
    blockTimestamp: row.block_timestamp ?? null,
    confirmations: row.confirmations,
    confirmedAt: row.confirmed_at ?? null,
    releaseTxHash: row.release_tx_hash ?? null,
    refundTxHash: row.refund_tx_hash ?? null,
    releasedAt: row.released_at ?? null,
    refundedAt: row.refunded_at ?? null,
    yieldEarned: row.yield_earned,
    yieldClaimed: row.yield_claimed,
    isAnonymous: Boolean(row.is_anonymous),
    createdAt: row.created_at,
    pledgedAt: row.pledged_at,
  }
}

/**
 * Maps a database row to summary format (for list views)
 */
export function toPledgeSummary(row: Pledge): PledgeSummary {
  return {
    id: row.pledge_id,
    campaignId: row.campaign_id,
    pledgerAddress: row.is_anonymous
      ? '0x0000000000000000000000000000000000000000'
      : row.pledger_address,
    amount: row.amount,
    status: row.status,
    isAnonymous: Boolean(row.is_anonymous),
    pledgedAt: row.pledged_at,
  }
}

/**
 * Maps multiple database rows to full API response format
 */
export function toPledgeResponseList(rows: Pledge[]): PledgeResponse[] {
  return rows.map(toPledgeResponse)
}

/**
 * Maps multiple database rows to summary format
 */
export function toPledgeSummaryList(rows: Pledge[]): PledgeSummary[] {
  return rows.map(toPledgeSummary)
}

/**
 * Format pledge amount for display (wei to ETH)
 */
export function formatPledgeAmount(weiAmount: string, decimals = 4): string {
  return Number(formatEther(BigInt(weiAmount))).toFixed(decimals)
}
