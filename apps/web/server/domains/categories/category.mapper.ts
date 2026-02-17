import type { Category, CategoryResponse } from './category.schema'

// =============================================================================
// CATEGORY MAPPER
// Purpose: Transform between database rows and API response formats
// =============================================================================

/**
 * Maps a database row to the API response format
 * Converts snake_case to camelCase and transforms types
 */
export function toCategoryResponse(row: Category): CategoryResponse {
  return {
    id: row.category_id,
    slug: row.category_id,
    name: row.name,
    description: row.description ?? null,
    icon: row.icon ?? null,
    color: row.color ?? null,
    parentCategoryId: row.parent_category_id ?? null,
    displayOrder: row.display_order,
    isActive: Boolean(row.is_active),
    isFeatured: Boolean(row.is_featured),
    campaignCount: row.campaign_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Maps multiple database rows to API response format
 */
export function toCategoryResponseList(rows: Category[]): CategoryResponse[] {
  return rows.map(toCategoryResponse)
}

/**
 * Generates a category ID (slug) from the name
 * Converts to lowercase, replaces spaces with hyphens, removes special chars
 */
export function generateCategoryId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
