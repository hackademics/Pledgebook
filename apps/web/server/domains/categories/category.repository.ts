import type { D1Database } from '@cloudflare/workers-types'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from './category.schema'

// =============================================================================
// CATEGORY REPOSITORY
// Purpose: Data access layer for Category entity
// Pattern: Repository pattern with parameterized queries for SQL injection prevention
// =============================================================================

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>
  findBySlug(slug: string): Promise<Category | null>
  findAll(query: ListCategoriesQuery): Promise<{ data: Category[]; total: number }>
  findFeatured(): Promise<Category[]>
  findActive(): Promise<Category[]>
  findChildren(parentId: string): Promise<Category[]>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category | null>
  delete(id: string): Promise<boolean>
  exists(id: string): Promise<boolean>
  count(filters?: { isActive?: boolean; isFeatured?: boolean }): Promise<number>
}

/**
 * D1 implementation of CategoryRepository
 */
export function createCategoryRepository(db: D1Database): CategoryRepository {
  return {
    /**
     * Find a category by its ID (primary key)
     */
    async findById(id: string): Promise<Category | null> {
      const result = await db
        .prepare('SELECT * FROM categories WHERE category_id = ?')
        .bind(id)
        .first<Category>()

      return result ?? null
    },

    /**
     * Find a category by slug (alias for findById since slug is the PK)
     */
    async findBySlug(slug: string): Promise<Category | null> {
      return this.findById(slug)
    },

    /**
     * Find all categories with pagination, sorting, and filtering
     */
    async findAll(query: ListCategoriesQuery): Promise<{ data: Category[]; total: number }> {
      const { page, limit, sortBy, sortOrder, isActive, isFeatured, parentCategoryId, search } =
        query

      // Build WHERE clause dynamically
      const conditions: string[] = []
      const params: (string | number | boolean)[] = []

      if (isActive !== undefined) {
        conditions.push('is_active = ?')
        params.push(isActive ? 1 : 0)
      }

      if (isFeatured !== undefined) {
        conditions.push('is_featured = ?')
        params.push(isFeatured ? 1 : 0)
      }

      if (parentCategoryId !== undefined) {
        if (parentCategoryId === 'null' || parentCategoryId === '') {
          conditions.push('parent_category_id IS NULL')
        } else {
          conditions.push('parent_category_id = ?')
          params.push(parentCategoryId)
        }
      }

      if (search) {
        conditions.push('(name LIKE ? OR description LIKE ?)')
        const searchPattern = `%${search}%`
        params.push(searchPattern, searchPattern)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

      // Validate sort column to prevent SQL injection
      const validSortColumns = ['name', 'display_order', 'campaign_count', 'created_at']
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'display_order'
      const safeOrder = sortOrder === 'desc' ? 'DESC' : 'ASC'

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM categories ${whereClause}`
      const countResult = await db
        .prepare(countQuery)
        .bind(...params)
        .first<{ count: number }>()
      const total = countResult?.count ?? 0

      // Get paginated data
      const offset = (page - 1) * limit
      const dataQuery = `
        SELECT * FROM categories 
        ${whereClause} 
        ORDER BY ${safeSort} ${safeOrder} 
        LIMIT ? OFFSET ?
      `
      const dataResult = await db
        .prepare(dataQuery)
        .bind(...params, limit, offset)
        .all<Category>()

      return {
        data: dataResult.results ?? [],
        total,
      }
    },

    /**
     * Find all featured categories (ordered by display_order)
     */
    async findFeatured(): Promise<Category[]> {
      const result = await db
        .prepare(
          'SELECT * FROM categories WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC',
        )
        .all<Category>()

      return result.results ?? []
    },

    /**
     * Find all active categories (ordered by display_order)
     */
    async findActive(): Promise<Category[]> {
      const result = await db
        .prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC')
        .all<Category>()

      return result.results ?? []
    },

    /**
     * Find child categories of a parent
     */
    async findChildren(parentId: string): Promise<Category[]> {
      const result = await db
        .prepare(
          'SELECT * FROM categories WHERE parent_category_id = ? AND is_active = 1 ORDER BY display_order ASC',
        )
        .bind(parentId)
        .all<Category>()

      return result.results ?? []
    },

    /**
     * Create a new category
     */
    async create(input: CreateCategoryInput): Promise<Category> {
      const now = new Date().toISOString()

      const result = await db
        .prepare(
          `INSERT INTO categories (
            category_id, name, description, icon, color, 
            parent_category_id, display_order, is_active, is_featured,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *`,
        )
        .bind(
          input.id,
          input.name,
          input.description ?? null,
          input.icon ?? null,
          input.color ?? null,
          input.parentCategoryId ?? null,
          input.displayOrder ?? 0,
          input.isActive ? 1 : 0,
          input.isFeatured ? 1 : 0,
          now,
          now,
        )
        .first<Category>()

      if (!result) {
        throw new Error('Failed to create category')
      }

      return result
    },

    /**
     * Update an existing category
     */
    async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
      // Build dynamic UPDATE query based on provided fields
      const updates: string[] = []
      const params: (string | number | null)[] = []

      if (input.name !== undefined) {
        updates.push('name = ?')
        params.push(input.name)
      }

      if (input.description !== undefined) {
        updates.push('description = ?')
        params.push(input.description ?? null)
      }

      if (input.icon !== undefined) {
        updates.push('icon = ?')
        params.push(input.icon ?? null)
      }

      if (input.color !== undefined) {
        updates.push('color = ?')
        params.push(input.color ?? null)
      }

      if (input.parentCategoryId !== undefined) {
        updates.push('parent_category_id = ?')
        params.push(input.parentCategoryId ?? null)
      }

      if (input.displayOrder !== undefined) {
        updates.push('display_order = ?')
        params.push(input.displayOrder)
      }

      if (input.isActive !== undefined) {
        updates.push('is_active = ?')
        params.push(input.isActive ? 1 : 0)
      }

      if (input.isFeatured !== undefined) {
        updates.push('is_featured = ?')
        params.push(input.isFeatured ? 1 : 0)
      }

      if (updates.length === 0) {
        // No fields to update, return existing
        return this.findById(id)
      }

      // Add updated_at
      updates.push('updated_at = ?')
      params.push(new Date().toISOString())

      // Add id for WHERE clause
      params.push(id)

      const query = `UPDATE categories SET ${updates.join(', ')} WHERE category_id = ? RETURNING *`
      const result = await db
        .prepare(query)
        .bind(...params)
        .first<Category>()

      return result ?? null
    },

    /**
     * Delete a category by ID
     * Returns true if deleted, false if not found
     */
    async delete(id: string): Promise<boolean> {
      const result = await db.prepare('DELETE FROM categories WHERE category_id = ?').bind(id).run()

      return result.meta.changes > 0
    },

    /**
     * Check if a category exists by ID
     */
    async exists(id: string): Promise<boolean> {
      const result = await db
        .prepare('SELECT 1 FROM categories WHERE category_id = ? LIMIT 1')
        .bind(id)
        .first()

      return result !== null
    },

    /**
     * Count categories with optional filters
     */
    async count(filters?: { isActive?: boolean; isFeatured?: boolean }): Promise<number> {
      const conditions: string[] = []
      const params: number[] = []

      if (filters?.isActive !== undefined) {
        conditions.push('is_active = ?')
        params.push(filters.isActive ? 1 : 0)
      }

      if (filters?.isFeatured !== undefined) {
        conditions.push('is_featured = ?')
        params.push(filters.isFeatured ? 1 : 0)
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
      const query = `SELECT COUNT(*) as count FROM categories ${whereClause}`

      const result = await db
        .prepare(query)
        .bind(...params)
        .first<{ count: number }>()

      return result?.count ?? 0
    },
  }
}
