import { z } from 'zod'

// =============================================================================
// DISPUTER DOMAIN SCHEMAS
// Purpose: Zod validation schemas for Disputer entity
// =============================================================================

/**
 * UUID validation for disputer ID
 */
export const disputerIdSchema = z.string().uuid('Invalid disputer ID format')

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
 * Disputer status enum
 */
export const disputerStatusSchema = z.enum([
  'pending',
  'active',
  'upheld',
  'rejected',
  'withdrawn',
  'expired',
])

/**
 * Dispute type enum
 */
export const disputeTypeSchema = z.enum([
  'fraud',
  'misrepresentation',
  'rule_violation',
  'verification_failure',
  'general',
])

/**
 * Resolution outcome enum
 */
export const resolutionOutcomeSchema = z.enum(['upheld', 'rejected', 'partial'])

/**
 * Wei amount validation
 */
export const weiAmountSchema = z.string().regex(/^\d+$/, 'Amount must be a positive integer string')

/**
 * Transaction hash validation
 */
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')

/**
 * Base Disputer schema (database row representation)
 */
export const disputerSchema = z.object({
  disputer_id: disputerIdSchema,
  campaign_id: campaignIdSchema,
  disputer_address: walletAddressSchema,
  amount: weiAmountSchema,
  status: disputerStatusSchema,
  reason: z.string(),
  dispute_type: disputeTypeSchema,
  evidence: z.string().default('[]'),
  stake_tx_hash: txHashSchema,
  resolution_tx_hash: z.string().nullable().optional(),
  block_number: z.number().int().nullable().optional(),
  block_timestamp: z.string().nullable().optional(),
  resolution_outcome: resolutionOutcomeSchema.nullable().optional(),
  resolution_notes: z.string().nullable().optional(),
  resolved_by: z.string().nullable().optional(),
  resolved_at: z.string().nullable().optional(),
  reward_earned: z.string().default('0'),
  stake_returned: z.string().default('0'),
  stake_slashed: z.string().default('0'),
  expires_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  disputed_at: z.string(),
})

/**
 * Disputer response type (API-friendly format)
 */
export const disputerResponseSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  disputerAddress: z.string(),
  amount: z.string(),
  status: disputerStatusSchema,
  reason: z.string(),
  disputeType: disputeTypeSchema,
  evidence: z.array(z.unknown()),
  stakeTxHash: z.string(),
  resolutionTxHash: z.string().nullable(),
  blockNumber: z.number().nullable(),
  blockTimestamp: z.string().nullable(),
  resolutionOutcome: resolutionOutcomeSchema.nullable(),
  resolutionNotes: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  rewardEarned: z.string(),
  stakeReturned: z.string(),
  stakeSlashed: z.string(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
  disputedAt: z.string(),
})

/**
 * Disputer summary (for list views)
 */
export const disputerSummarySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  disputerAddress: z.string(),
  amount: z.string(),
  status: disputerStatusSchema,
  reason: z.string(),
  disputeType: disputeTypeSchema,
  disputedAt: z.string(),
})

/**
 * Evidence item schema
 */
export const evidenceItemSchema = z.object({
  type: z.enum(['url', 'text', 'image', 'document']),
  content: z.string().max(2000),
  description: z.string().max(500).optional(),
  submittedAt: z.string().datetime().optional(),
})

/**
 * Create disputer request schema
 */
export const createDisputerSchema = z.object({
  campaignId: campaignIdSchema,
  amount: weiAmountSchema,
  stakeTxHash: txHashSchema,
  reason: z.string().min(10).max(2000).trim(),
  disputeType: disputeTypeSchema.optional().default('general'),
  evidence: z.array(evidenceItemSchema).max(10).optional().default([]),
  blockNumber: z.number().int().optional(),
  blockTimestamp: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

/**
 * Update disputer request schema
 */
export const updateDisputerSchema = z.object({
  status: disputerStatusSchema.optional(),
  evidence: z.array(evidenceItemSchema).max(10).optional(),
})

/**
 * Resolve disputer request schema
 */
export const resolveDisputerSchema = z.object({
  outcome: resolutionOutcomeSchema,
  resolutionTxHash: txHashSchema.optional(),
  notes: z.string().max(2000).optional(),
  rewardEarned: weiAmountSchema.optional(),
  stakeReturned: weiAmountSchema.optional(),
  stakeSlashed: weiAmountSchema.optional(),
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
 * Query parameters for listing disputers
 */
export const listDisputersQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z.enum(['amount', 'disputed_at', 'created_at']).optional().default('disputed_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  campaignId: campaignIdSchema.optional(),
  disputerAddress: z.string().optional(),
  status: disputerStatusSchema.optional(),
  disputeType: disputeTypeSchema.optional(),
})

// =============================================================================
// TYPE EXPORTS
// Use z.output for schemas with defaults/transforms
// =============================================================================

export type Disputer = z.infer<typeof disputerSchema>
export type DisputerResponse = z.infer<typeof disputerResponseSchema>
export type DisputerSummary = z.infer<typeof disputerSummarySchema>
export type EvidenceItem = z.infer<typeof evidenceItemSchema>
export type CreateDisputerInput = z.output<typeof createDisputerSchema>
export type UpdateDisputerInput = z.output<typeof updateDisputerSchema>
export type ResolveDisputerInput = z.output<typeof resolveDisputerSchema>
export type ListDisputersQuery = z.output<typeof listDisputersQuerySchema>
export type DisputerStatus = z.infer<typeof disputerStatusSchema>
export type DisputeType = z.infer<typeof disputeTypeSchema>
export type ResolutionOutcome = z.infer<typeof resolutionOutcomeSchema>
