import { z } from 'zod'

// =============================================================================
// CATEGORY DOMAIN SCHEMAS
// Purpose: Zod validation schemas for Category entity
// =============================================================================

/**
 * Category ID validation (kebab-case slug)
 */
export const categoryIdSchema = z
  .string()
  .min(2, 'Category ID must be at least 2 characters')
  .max(50, 'Category ID must not exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Category ID must be lowercase with hyphens only (kebab-case)')

/**
 * Category name validation
 */
export const categoryNameSchema = z
  .string()
  .min(2, 'Category name must be at least 2 characters')
  .max(100, 'Category name must not exceed 100 characters')
  .trim()

/**
 * Category description validation
 */
export const categoryDescriptionSchema = z
  .string()
  .max(500, 'Description must not exceed 500 characters')
  .trim()
  .nullable()
  .optional()

/**
 * Hex color validation
 */
export const hexColorSchema = z
  .string()
  .regex(/^#[a-f0-9]{6}$/i, 'Color must be a valid hex color (e.g., #FF5733)')
  .nullable()
  .optional()

/**
 * Base Category schema (database row representation)
 */
export const categorySchema = z.object({
  category_id: categoryIdSchema,
  name: categoryNameSchema,
  description: categoryDescriptionSchema,
  icon: z.string().nullable().optional(),
  color: hexColorSchema,
  parent_category_id: categoryIdSchema.nullable().optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(true),
  is_featured: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  campaign_count: z.number().int().min(0).default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

/**
 * Category response type (API-friendly format)
 */
export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  parentCategoryId: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  campaignCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * Create category request schema
 */
export const createCategorySchema = z.object({
  id: categoryIdSchema,
  name: categoryNameSchema,
  description: categoryDescriptionSchema,
  icon: z.string().max(50).nullable().optional(),
  color: hexColorSchema,
  parentCategoryId: categoryIdSchema.nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
})

/**
 * Update category request schema (all fields optional except id)
 */
export const updateCategorySchema = z.object({
  name: categoryNameSchema.optional(),
  description: categoryDescriptionSchema,
  icon: z.string().max(50).nullable().optional(),
  color: hexColorSchema,
  parentCategoryId: categoryIdSchema.nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
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
 * Query parameters for listing categories
 * Note: Using preprocess pattern to handle missing query params from h3's getQuery
 */
export const listCategoriesQuerySchema = z.object({
  page: coerceNumber(1).pipe(z.number().min(1)),
  limit: coerceNumber(20).pipe(z.number().min(1).max(100)),
  sortBy: z
    .enum(['name', 'display_order', 'campaign_count', 'created_at'])
    .optional()
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  parentCategoryId: z.string().optional(),
  search: z.string().max(100).optional(),
})

// =============================================================================
// TYPE EXPORTS
// Using z.output for schemas with defaults to get the transformed/defaulted types
// =============================================================================

export type Category = z.infer<typeof categorySchema>
export type CategoryResponse = z.infer<typeof categoryResponseSchema>
export type CreateCategoryInput = z.output<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ListCategoriesQuery = z.output<typeof listCategoriesQuerySchema>
