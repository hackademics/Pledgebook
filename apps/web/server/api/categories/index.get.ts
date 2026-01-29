import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createCategoryRepository,
  createCategoryService,
  listCategoriesQuerySchema,
} from '../../domains/categories'

/**
 * GET /api/categories
 * List all categories with pagination, sorting, and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'name' | 'display_order' | 'campaign_count' | 'created_at' (default: 'display_order')
 * - sortOrder: 'asc' | 'desc' (default: 'asc')
 * - isActive: boolean (optional)
 * - isFeatured: boolean (optional)
 * - parentCategoryId: string (optional, use 'null' for root categories)
 * - search: string (optional, searches name and description)
 *
 * @returns {ApiResponse<CategoryResponse[]>} Paginated list of categories
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listCategoriesQuerySchema)

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Get categories
    const { data, meta } = await service.getAll(query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
