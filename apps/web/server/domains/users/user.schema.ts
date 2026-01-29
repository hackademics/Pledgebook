import { z } from 'zod'

// =============================================================================
// USER DOMAIN SCHEMAS
// Purpose: Zod validation schemas for User entity (wallet-only auth)
// =============================================================================

/**
 * Ethereum wallet address validation (0x + 40 hex chars)
 */
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
  .transform((val) => val.toLowerCase()) // Normalize to lowercase

/**
 * User role validation
 */
export const userRoleSchema = z.enum(['user', 'admin', 'verifier'])

/**
 * User preferences JSON schema
 */
export const userPreferencesSchema = z
  .object({
    privacyMode: z.boolean().default(false),
    notifications: z.boolean().default(true),
  })
  .default({ privacyMode: false, notifications: true })

/**
 * Base User schema (database row representation)
 */
export const userSchema = z.object({
  address: walletAddressSchema,
  role: userRoleSchema,
  preferences: z.string().transform((val) => {
    try {
      return JSON.parse(val) as z.infer<typeof userPreferencesSchema>
    } catch {
      return { privacyMode: false, notifications: true }
    }
  }),
  display_name: z.string().nullable().optional(),
  ens_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  reputation_score: z.number().int().min(0).default(0),
  campaigns_created: z.number().int().min(0).default(0),
  pledges_made: z.number().int().min(0).default(0),
  total_pledged: z.string().default('0'),
  is_active: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(true),
  is_banned: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  ban_reason: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  last_login_at: z.string().nullable().optional(),
  last_active_at: z.string().nullable().optional(),
})

/**
 * User response type (API-friendly format)
 */
export const userResponseSchema = z.object({
  address: z.string(),
  role: userRoleSchema,
  preferences: userPreferencesSchema,
  displayName: z.string().nullable(),
  ensName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  reputationScore: z.number(),
  campaignsCreated: z.number(),
  pledgesMade: z.number(),
  totalPledged: z.string(),
  isActive: z.boolean(),
  isBanned: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().nullable(),
  lastActiveAt: z.string().nullable(),
})

/**
 * Public user profile (limited info for privacy)
 */
export const userProfileResponseSchema = z.object({
  address: z.string(),
  displayName: z.string().nullable(),
  ensName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  reputationScore: z.number(),
  campaignsCreated: z.number(),
  pledgesMade: z.number(),
  createdAt: z.string(),
})

/**
 * Create user request schema (for first-time wallet connection)
 */
export const createUserSchema = z.object({
  address: walletAddressSchema,
  displayName: z.string().min(2).max(50).trim().nullable().optional(),
  ensName: z.string().max(100).nullable().optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
})

/**
 * Update user request schema
 */
export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(50).trim().nullable().optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
  preferences: z
    .object({
      privacyMode: z.boolean().optional(),
      notifications: z.boolean().optional(),
    })
    .optional(),
})

/**
 * Admin update user schema (can modify more fields)
 */
export const adminUpdateUserSchema = updateUserSchema.extend({
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().max(500).nullable().optional(),
})

/**
 * Coerce string to number with undefined fallback
 */
const coerceNumber = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === '' ? defaultValue : Number(val)),
    z.number().int()
  )

/**
 * Query parameters for listing users
 */
export const listUsersQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z
    .enum(['reputation_score', 'campaigns_created', 'pledges_made', 'created_at', 'last_active_at'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  role: userRoleSchema.optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  isBanned: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().max(100).optional(),
})

// =============================================================================
// TYPE EXPORTS
// Use z.output for schemas with defaults/transforms
// =============================================================================

export type User = z.infer<typeof userSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>
export type CreateUserInput = z.output<typeof createUserSchema>
export type UpdateUserInput = z.output<typeof updateUserSchema>
export type AdminUpdateUserInput = z.output<typeof adminUpdateUserSchema>
export type ListUsersQuery = z.output<typeof listUsersQuerySchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
