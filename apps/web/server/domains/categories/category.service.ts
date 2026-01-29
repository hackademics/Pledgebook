import type { CategoryRepository } from './category.repository'
import type {
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from './category.schema'
import { toCategoryResponse, toCategoryResponseList } from './category.mapper'
import { createApiError, ApiErrorCode } from '../../utils/errors'

// =============================================================================
// CATEGORY SERVICE
// Purpose: Business logic layer for Category operations
// Pattern: Service layer that orchestrates repository calls and applies business rules
// =============================================================================

export interface CategoryService {
  getById(id: string): Promise<CategoryResponse>
  getAll(query: ListCategoriesQuery): Promise<{
    data: CategoryResponse[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }>
  getFeatured(): Promise<CategoryResponse[]>
  getActive(): Promise<CategoryResponse[]>
  getChildren(parentId: string): Promise<CategoryResponse[]>
  create(input: CreateCategoryInput): Promise<CategoryResponse>
  update(id: string, input: UpdateCategoryInput): Promise<CategoryResponse>
  delete(id: string): Promise<void>
}

/**
 * Create a CategoryService instance
 */
export function createCategoryService(repository: CategoryRepository): CategoryService {
  return {
    /**
     * Get a category by ID
     * @throws ApiError if not found
     */
    async getById(id: string): Promise<CategoryResponse> {
      const category = await repository.findById(id)

      if (!category) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Category with ID '${id}' not found`, {
          resourceType: 'category',
          resourceId: id,
        })
      }

      return toCategoryResponse(category)
    },

    /**
     * Get all categories with pagination and filtering
     */
    async getAll(query: ListCategoriesQuery): Promise<{
      data: CategoryResponse[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }> {
      const { data, total } = await repository.findAll(query)

      return {
        data: toCategoryResponseList(data),
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      }
    },

    /**
     * Get all featured categories
     */
    async getFeatured(): Promise<CategoryResponse[]> {
      const categories = await repository.findFeatured()
      return toCategoryResponseList(categories)
    },

    /**
     * Get all active categories
     */
    async getActive(): Promise<CategoryResponse[]> {
      const categories = await repository.findActive()
      return toCategoryResponseList(categories)
    },

    /**
     * Get child categories of a parent
     * @throws ApiError if parent not found
     */
    async getChildren(parentId: string): Promise<CategoryResponse[]> {
      // Verify parent exists
      const parentExists = await repository.exists(parentId)
      if (!parentExists) {
        throw createApiError(
          ApiErrorCode.NOT_FOUND,
          `Parent category with ID '${parentId}' not found`,
          { resourceType: 'category', resourceId: parentId }
        )
      }

      const children = await repository.findChildren(parentId)
      return toCategoryResponseList(children)
    },

    /**
     * Create a new category
     * @throws ApiError if ID already exists or parent not found
     */
    async create(input: CreateCategoryInput): Promise<CategoryResponse> {
      // Check if ID already exists
      const exists = await repository.exists(input.id)
      if (exists) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `Category with ID '${input.id}' already exists`,
          { field: 'id', value: input.id }
        )
      }

      // Validate parent exists if provided
      if (input.parentCategoryId) {
        const parentExists = await repository.exists(input.parentCategoryId)
        if (!parentExists) {
          throw createApiError(
            ApiErrorCode.VALIDATION_ERROR,
            `Parent category '${input.parentCategoryId}' does not exist`,
            { field: 'parentCategoryId', value: input.parentCategoryId }
          )
        }

        // Prevent circular reference
        if (input.parentCategoryId === input.id) {
          throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Category cannot be its own parent', {
            field: 'parentCategoryId',
          })
        }
      }

      const category = await repository.create(input)
      return toCategoryResponse(category)
    },

    /**
     * Update an existing category
     * @throws ApiError if not found or validation fails
     */
    async update(id: string, input: UpdateCategoryInput): Promise<CategoryResponse> {
      // Check if category exists
      const exists = await repository.exists(id)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Category with ID '${id}' not found`, {
          resourceType: 'category',
          resourceId: id,
        })
      }

      // Validate parent exists if being changed
      if (input.parentCategoryId !== undefined && input.parentCategoryId !== null) {
        const parentExists = await repository.exists(input.parentCategoryId)
        if (!parentExists) {
          throw createApiError(
            ApiErrorCode.VALIDATION_ERROR,
            `Parent category '${input.parentCategoryId}' does not exist`,
            { field: 'parentCategoryId', value: input.parentCategoryId }
          )
        }

        // Prevent circular reference
        if (input.parentCategoryId === id) {
          throw createApiError(ApiErrorCode.VALIDATION_ERROR, 'Category cannot be its own parent', {
            field: 'parentCategoryId',
          })
        }
      }

      const updated = await repository.update(id, input)

      if (!updated) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to update category')
      }

      return toCategoryResponse(updated)
    },

    /**
     * Delete a category
     * @throws ApiError if not found or has children
     */
    async delete(id: string): Promise<void> {
      // Check if category exists
      const exists = await repository.exists(id)
      if (!exists) {
        throw createApiError(ApiErrorCode.NOT_FOUND, `Category with ID '${id}' not found`, {
          resourceType: 'category',
          resourceId: id,
        })
      }

      // Check for child categories
      const children = await repository.findChildren(id)
      if (children.length > 0) {
        throw createApiError(
          ApiErrorCode.CONFLICT,
          `Cannot delete category '${id}' because it has ${children.length} child categories`,
          { childCount: children.length }
        )
      }

      const deleted = await repository.delete(id)
      if (!deleted) {
        throw createApiError(ApiErrorCode.INTERNAL_ERROR, 'Failed to delete category')
      }
    },
  }
}
