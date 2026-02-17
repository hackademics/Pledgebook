import { z } from 'zod'
import {
  walletAddressSchema,
  campaignIdSchema,
  weiAmountSchema,
  txHashSchema,
  coerceNumber,
} from '../shared.schema'

export { walletAddressSchema, campaignIdSchema, weiAmountSchema, txHashSchema }

// =============================================================================
// PLEDGE DOMAIN SCHEMAS
// Purpose: Zod validation schemas for Pledge entity
// =============================================================================

/**
 * UUID validation for pledge ID
 */
export const pledgeIdSchema = z.string().uuid('Invalid pledge ID format')

/**
 * Pledge status enum
 */
export const pledgeStatusSchema = z.enum([
  'pending',
  'confirmed',
  'active',
  'released',
  'refunded',
  'failed',
])

/**
 * Base Pledge schema (database row representation)
 */
export const pledgeSchema = z.object({
  pledge_id: pledgeIdSchema,
  campaign_id: campaignIdSchema,
  pledger_address: walletAddressSchema,
  amount: weiAmountSchema,
  message: z.string().nullable().optional(),
  status: pledgeStatusSchema,
  tx_hash: txHashSchema,
  block_number: z.number().int().nullable().optional(),
  block_timestamp: z.string().nullable().optional(),
  confirmations: z.number().int().min(0).default(0),
  confirmed_at: z.string().nullable().optional(),
  release_tx_hash: z.string().nullable().optional(),
  refund_tx_hash: z.string().nullable().optional(),
  released_at: z.string().nullable().optional(),
  refunded_at: z.string().nullable().optional(),
  yield_earned: z.string().default('0'),
  yield_claimed: z.string().default('0'),
  last_yield_claim_at: z.string().nullable().optional(),
  is_anonymous: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  created_at: z.string(),
  updated_at: z.string(),
  pledged_at: z.string(),
})

/**
 * Pledge response type (API-friendly format)
 */
export const pledgeResponseSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  pledgerAddress: z.string(),
  amount: z.string(),
  message: z.string().nullable(),
  status: pledgeStatusSchema,
  txHash: z.string(),
  blockNumber: z.number().nullable(),
  blockTimestamp: z.string().nullable(),
  confirmations: z.number(),
  confirmedAt: z.string().nullable(),
  releaseTxHash: z.string().nullable(),
  refundTxHash: z.string().nullable(),
  releasedAt: z.string().nullable(),
  refundedAt: z.string().nullable(),
  yieldEarned: z.string(),
  yieldClaimed: z.string(),
  isAnonymous: z.boolean(),
  createdAt: z.string(),
  pledgedAt: z.string(),
})

/**
 * Pledge summary (for list views)
 */
export const pledgeSummarySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  pledgerAddress: z.string(),
  amount: z.string(),
  status: pledgeStatusSchema,
  isAnonymous: z.boolean(),
  pledgedAt: z.string(),
})

/**
 * Create pledge request schema
 */
export const createPledgeSchema = z.object({
  campaignId: campaignIdSchema,
  amount: weiAmountSchema,
  txHash: txHashSchema,
  message: z.string().max(280).trim().nullable().optional(),
  isAnonymous: z.boolean().optional().default(false),
  blockNumber: z.number().int().optional(),
  blockTimestamp: z.string().datetime().optional(),
})

/**
 * Update pledge request schema (for status updates)
 */
export const updatePledgeSchema = z.object({
  status: pledgeStatusSchema.optional(),
  confirmations: z.number().int().min(0).optional(),
  releaseTxHash: txHashSchema.optional(),
  refundTxHash: txHashSchema.optional(),
})

/**
 * Query parameters for listing pledges
 */
export const listPledgesQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z.enum(['amount', 'pledged_at', 'created_at']).optional().default('pledged_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  campaignId: campaignIdSchema.optional(),
  pledgerAddress: z.string().optional(),
  status: pledgeStatusSchema.optional(),
})

// =============================================================================
// TYPE EXPORTS
// Use z.output for schemas with defaults/transforms
// =============================================================================

export type Pledge = z.infer<typeof pledgeSchema>
export type PledgeResponse = z.infer<typeof pledgeResponseSchema>
export type PledgeSummary = z.infer<typeof pledgeSummarySchema>
export type CreatePledgeInput = z.output<typeof createPledgeSchema>
export type UpdatePledgeInput = z.output<typeof updatePledgeSchema>
export type ListPledgesQuery = z.output<typeof listPledgesQuerySchema>
export type PledgeStatus = z.infer<typeof pledgeStatusSchema>
