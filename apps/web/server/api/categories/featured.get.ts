import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createCategoryRepository, createCategoryService } from '../../domains/categories'

/**
 * GET /api/categories/featured
 * Get all featured categories
 *
 * Returns only active categories that are marked as featured,
 * ordered by display_order
 *
 * @returns {ApiResponse<CategoryResponse[]>} List of featured categories
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Get featured categories
    const categories = await service.getFeatured()

    return sendSuccess(event, categories)
  } catch (error) {
    throw handleError(error)
  }
})
