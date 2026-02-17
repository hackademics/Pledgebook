import type { Voucher, VoucherResponse, VoucherSummary } from './voucher.schema'
import { formatEther } from 'viem'

// =============================================================================
// VOUCHER MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Maps a database row to the full API response format
 */
export function toVoucherResponse(row: Voucher, campaignSlug?: string): VoucherResponse {
  return {
    id: row.voucher_id,
    campaignId: row.campaign_id,
    ...(campaignSlug ? { campaignSlug } : {}),
    voucherAddress: row.voucher_address,
    amount: row.amount,
    status: row.status,
    endorsementMessage: row.endorsement_message ?? null,
    stakeTxHash: row.stake_tx_hash,
    releaseTxHash: row.release_tx_hash ?? null,
    slashTxHash: row.slash_tx_hash ?? null,
    blockNumber: row.block_number ?? null,
    blockTimestamp: row.block_timestamp ?? null,
    rewardEarned: row.reward_earned,
    rewardClaimed: row.reward_claimed,
    rewardClaimedAt: row.reward_claimed_at ?? null,
    slashAmount: row.slash_amount,
    slashReason: row.slash_reason ?? null,
    slashedAt: row.slashed_at ?? null,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    vouchedAt: row.vouched_at,
    releasedAt: row.released_at ?? null,
    withdrawnAt: row.withdrawn_at ?? null,
  }
}

/**
 * Maps a database row to summary format (for list views)
 */
export function toVoucherSummary(row: Voucher, campaignSlug?: string): VoucherSummary {
  return {
    id: row.voucher_id,
    campaignId: row.campaign_id,
    ...(campaignSlug ? { campaignSlug } : {}),
    voucherAddress: row.voucher_address,
    amount: row.amount,
    status: row.status,
    endorsementMessage: row.endorsement_message ?? null,
    vouchedAt: row.vouched_at,
  }
}

/**
 * Maps multiple database rows to full API response format
 */
export function toVoucherResponseList(rows: Voucher[]): VoucherResponse[] {
  return rows.map(toVoucherResponse)
}

/**
 * Maps multiple database rows to summary format
 */
export function toVoucherSummaryList(rows: Voucher[]): VoucherSummary[] {
  return rows.map(toVoucherSummary)
}

/**
 * Format voucher amount for display (wei to ETH)
 */
export function formatVoucherAmount(weiAmount: string, decimals = 4): string {
  return Number(formatEther(BigInt(weiAmount))).toFixed(decimals)
}
