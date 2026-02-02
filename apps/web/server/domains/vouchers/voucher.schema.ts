import { z } from 'zod'

// =============================================================================
// VOUCHER DOMAIN SCHEMAS
// Purpose: Zod validation schemas for Voucher (Endorser) entity
// =============================================================================

/**
 * UUID validation for voucher ID
 */
export const voucherIdSchema = z.string().uuid('Invalid voucher ID format')

/**
 * Campaign ID validation
 */
export const campaignIdSchema = z.string().uuid('Invalid campaign ID format')

/**
 * Ethereum wallet address validation
 */
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
  .transform((val) => val.toLowerCase())

/**
 * Voucher status enum
 */
export const voucherStatusSchema = z.enum([
  'pending',
  'active',
  'released',
  'slashed',
  'withdrawn',
  'expired',
])

/**
 * Wei amount validation
 */
export const weiAmountSchema = z.string().regex(/^\d+$/, 'Amount must be a positive integer string')

/**
 * Transaction hash validation
 */
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')

/**
 * Base Voucher schema (database row representation)
 */
export const voucherSchema = z.object({
  voucher_id: voucherIdSchema,
  campaign_id: campaignIdSchema,
  voucher_address: walletAddressSchema,
  amount: weiAmountSchema,
  status: voucherStatusSchema,
  endorsement_message: z.string().nullable().optional(),
  stake_tx_hash: txHashSchema,
  release_tx_hash: z.string().nullable().optional(),
  slash_tx_hash: z.string().nullable().optional(),
  block_number: z.number().int().nullable().optional(),
  block_timestamp: z.string().nullable().optional(),
  reward_earned: z.string().default('0'),
  reward_claimed: z.string().default('0'),
  reward_claimed_at: z.string().nullable().optional(),
  slash_amount: z.string().default('0'),
  slash_reason: z.string().nullable().optional(),
  slashed_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  vouched_at: z.string(),
  released_at: z.string().nullable().optional(),
  withdrawn_at: z.string().nullable().optional(),
})

/**
 * Voucher response type (API-friendly format)
 */
export const voucherResponseSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  voucherAddress: z.string(),
  amount: z.string(),
  status: voucherStatusSchema,
  endorsementMessage: z.string().nullable(),
  stakeTxHash: z.string(),
  releaseTxHash: z.string().nullable(),
  slashTxHash: z.string().nullable(),
  blockNumber: z.number().nullable(),
  blockTimestamp: z.string().nullable(),
  rewardEarned: z.string(),
  rewardClaimed: z.string(),
  rewardClaimedAt: z.string().nullable(),
  slashAmount: z.string(),
  slashReason: z.string().nullable(),
  slashedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  vouchedAt: z.string(),
  releasedAt: z.string().nullable(),
  withdrawnAt: z.string().nullable(),
})

/**
 * Voucher summary (for list views)
 */
export const voucherSummarySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  voucherAddress: z.string(),
  amount: z.string(),
  status: voucherStatusSchema,
  endorsementMessage: z.string().nullable(),
  vouchedAt: z.string(),
})

/**
 * Create voucher request schema
 */
export const createVoucherSchema = z.object({
  campaignId: campaignIdSchema,
  amount: weiAmountSchema,
  stakeTxHash: txHashSchema,
  endorsementMessage: z.string().max(500).trim().nullable().optional(),
  blockNumber: z.number().int().optional(),
  blockTimestamp: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

/**
 * Update voucher request schema
 */
export const updateVoucherSchema = z.object({
  status: voucherStatusSchema.optional(),
  releaseTxHash: txHashSchema.optional(),
  slashTxHash: txHashSchema.optional(),
  slashAmount: weiAmountSchema.optional(),
  slashReason: z.string().max(500).optional(),
  rewardEarned: weiAmountSchema.optional(),
})

/**
 * Coerce string to number with undefined fallback
 */
const coerceNumber = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === '' ? defaultValue : Number(val)),
    z.number().int(),
  )

/**
 * Query parameters for listing vouchers
 */
export const listVouchersQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z.enum(['amount', 'vouched_at', 'created_at']).optional().default('vouched_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  campaignId: campaignIdSchema.optional(),
  voucherAddress: z.string().optional(),
  status: voucherStatusSchema.optional(),
})

// =============================================================================
// TYPE EXPORTS
// Use z.output for schemas with defaults/transforms
// =============================================================================

export type Voucher = z.infer<typeof voucherSchema>
export type VoucherResponse = z.infer<typeof voucherResponseSchema>
export type VoucherSummary = z.infer<typeof voucherSummarySchema>
export type CreateVoucherInput = z.output<typeof createVoucherSchema>
export type UpdateVoucherInput = z.output<typeof updateVoucherSchema>
export type ListVouchersQuery = z.output<typeof listVouchersQuerySchema>
export type VoucherStatus = z.infer<typeof voucherStatusSchema>
