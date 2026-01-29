// =============================================================================
// CATEGORY DOMAIN - BARREL EXPORT
// =============================================================================

// Schemas & Types
export {
  categorySchema,
  categoryResponseSchema,
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
  categoryIdSchema,
  categoryNameSchema,
  type Category,
  type CategoryResponse,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type ListCategoriesQuery,
} from './category.schema'

// Mapper
export { toCategoryResponse, toCategoryResponseList, generateCategoryId } from './category.mapper'

// Repository
export { type CategoryRepository, createCategoryRepository } from './category.repository'

// Service
export { type CategoryService, createCategoryService } from './category.service'
