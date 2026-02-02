import { z } from 'zod'

// =============================================================================
// CAMPAIGN DOMAIN SCHEMAS
// Purpose: Zod validation schemas for Campaign entity
// =============================================================================

/**
 * UUID validation for campaign ID
 */
export const campaignIdSchema = z.string().uuid('Invalid campaign ID format')

/**
 * Campaign slug validation (URL-friendly identifier)
 */
export const campaignSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only')

/**
 * Ethereum wallet address validation
 */
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
  .transform((val) => val.toLowerCase())

/**
 * Campaign status enum
 */
export const campaignStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'active',
  'complete',
  'failed',
  'disputed',
  'cancelled',
])

/**
 * Wei amount validation (stored as string for large numbers)
 */
export const weiAmountSchema = z.string().regex(/^\d+$/, 'Amount must be a positive integer string')

/**
 * Base Campaign schema (database row representation)
 */
export const campaignSchema = z.object({
  campaign_id: campaignIdSchema,
  creator_address: walletAddressSchema,
  name: z.string(),
  slug: campaignSlugSchema,
  purpose: z.string(),
  rules_and_resolution: z.string(),
  prompt: z.string(),
  prompt_hash: z.string(),
  status: campaignStatusSchema,
  baseline_data: z.string().default('{}'),
  privacy_mode: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  consensus_threshold: z.number().min(0.5).max(1.0).default(0.66),
  creator_bond: z.string().default('0'),
  amount_pledged: z.string().default('0'),
  fundraising_goal: z.string(),
  yield_rate: z.number().default(0.0),
  yield_pool: z.string().default('0'),
  tags: z.string().default('[]'),
  categories: z.string().default('[]'),
  image_url: z.string().nullable().optional(),
  banner_url: z.string().nullable().optional(),
  is_showcased: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  is_featured: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  is_verified: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  history: z.string().default('[]'),
  consensus_results: z.string().default('[]'),
  is_disputed: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  dispute_reason: z.string().nullable().optional(),
  dispute_resolution: z.string().nullable().optional(),
  escrow_address: z.string().nullable().optional(),
  creation_tx_hash: z.string().nullable().optional(),
  activation_tx_hash: z.string().nullable().optional(),
  completion_tx_hash: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string(),
  pledge_count: z.number().int().min(0).default(0),
  unique_pledgers: z.number().int().min(0).default(0),
  voucher_count: z.number().int().min(0).default(0),
  disputer_count: z.number().int().min(0).default(0),
  created_at: z.string(),
  updated_at: z.string(),
  submitted_at: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  activated_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  is_deleted: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  deleted_at: z.string().nullable().optional(),
})

/**
 * Campaign response type (API-friendly format)
 */
export const campaignResponseSchema = z.object({
  id: z.string(),
  creatorAddress: z.string(),
  name: z.string(),
  slug: z.string(),
  purpose: z.string(),
  rulesAndResolution: z.string(),
  prompt: z.string(),
  promptHash: z.string(),
  status: campaignStatusSchema,
  baselineData: z.record(z.unknown()),
  privacyMode: z.boolean(),
  consensusThreshold: z.number(),
  creatorBond: z.string(),
  amountPledged: z.string(),
  fundraisingGoal: z.string(),
  yieldRate: z.number(),
  yieldPool: z.string(),
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  imageUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  isShowcased: z.boolean(),
  isFeatured: z.boolean(),
  isVerified: z.boolean(),
  isDisputed: z.boolean(),
  escrowAddress: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string(),
  pledgeCount: z.number(),
  uniquePledgers: z.number(),
  voucherCount: z.number(),
  disputerCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  submittedAt: z.string().nullable(),
  approvedAt: z.string().nullable(),
  activatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
})

/**
 * Campaign summary (for list views)
 */
export const campaignSummarySchema = z.object({
  id: z.string(),
  creatorAddress: z.string(),
  name: z.string(),
  slug: z.string(),
  purpose: z.string(),
  status: campaignStatusSchema,
  imageUrl: z.string().nullable(),
  amountPledged: z.string(),
  fundraisingGoal: z.string(),
  pledgeCount: z.number(),
  isShowcased: z.boolean(),
  isFeatured: z.boolean(),
  isVerified: z.boolean(),
  endDate: z.string(),
  createdAt: z.string(),
})

/**
 * Create campaign request schema
 */
export const createCampaignSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  slug: campaignSlugSchema.optional(),
  purpose: z.string().min(10).max(1000).trim(),
  rulesAndResolution: z.string().min(10).max(2000).trim(),
  prompt: z.string().min(20).max(5000).trim(),
  fundraisingGoal: weiAmountSchema,
  endDate: z.string().datetime(),
  startDate: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  categories: z.array(z.string()).max(5).optional().default([]),
  imageUrl: z.string().url().max(500).nullable().optional(),
  bannerUrl: z.string().url().max(500).nullable().optional(),
  privacyMode: z.boolean().optional().default(false),
  consensusThreshold: z.number().min(0.5).max(1.0).optional().default(0.66),
})

/**
 * Update campaign request schema
 */
export const updateCampaignSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  purpose: z.string().min(10).max(1000).trim().optional(),
  rulesAndResolution: z.string().min(10).max(2000).trim().optional(),
  prompt: z.string().min(20).max(5000).trim().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  categories: z.array(z.string()).max(5).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  bannerUrl: z.string().url().max(500).nullable().optional(),
  privacyMode: z.boolean().optional(),
})

/**
 * Admin update campaign schema
 */
export const adminUpdateCampaignSchema = updateCampaignSchema.extend({
  status: campaignStatusSchema.optional(),
  isShowcased: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
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
 * Query parameters for listing campaigns
 */
export const listCampaignsQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z
    .enum(['created_at', 'end_date', 'amount_pledged', 'pledge_count', 'name'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: campaignStatusSchema.optional(),
  creatorAddress: z.string().optional(),
  isShowcased: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  isVerified: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  category: z.string().optional(),
  search: z.string().max(100).optional(),
})

// =============================================================================
// TYPE EXPORTS
// Use z.output for schemas with defaults/transforms
// =============================================================================

export type Campaign = z.infer<typeof campaignSchema>
export type CampaignResponse = z.infer<typeof campaignResponseSchema>
export type CampaignSummary = z.infer<typeof campaignSummarySchema>
export type CreateCampaignInput = z.output<typeof createCampaignSchema>
export type UpdateCampaignInput = z.output<typeof updateCampaignSchema>
export type AdminUpdateCampaignInput = z.output<typeof adminUpdateCampaignSchema>
export type ListCampaignsQuery = z.output<typeof listCampaignsQuerySchema>
export type CampaignStatus = z.infer<typeof campaignStatusSchema>
