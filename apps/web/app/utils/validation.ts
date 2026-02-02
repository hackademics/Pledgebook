import { z } from 'zod'

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required')

/**
 * Password validation schema with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Z0-9]/i, 'Password must contain at least one special character')

/**
 * Phone number validation schema
 */
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format')

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * Pagination request schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

/**
 * Base API response schema
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
    meta: z
      .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
  })

// Type exports
export type Email = z.infer<typeof emailSchema>
export type Password = z.infer<typeof passwordSchema>
export type Phone = z.infer<typeof phoneSchema>
export type Pagination = z.infer<typeof paginationSchema>
