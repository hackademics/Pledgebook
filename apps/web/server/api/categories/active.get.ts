import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createCategoryRepository, createCategoryService } from '../../domains/categories'

/**
 * GET /api/categories/active
 * Get all active categories
 *
 * Returns only categories where isActive = true,
 * ordered by display_order
 *
 * @returns {ApiResponse<CategoryResponse[]>} List of active categories
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Get active categories
    const categories = await service.getActive()

    return sendSuccess(event, categories)
  } catch (error) {
    throw handleError(error)
  }
})
