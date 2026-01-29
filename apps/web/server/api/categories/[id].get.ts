import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createCategoryRepository, createCategoryService } from '../../domains/categories'

/**
 * GET /api/categories/:id
 * Get a single category by ID
 *
 * Path Parameters:
 * - id: string (category slug/ID)
 *
 * @returns {ApiResponse<CategoryResponse>} Single category
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get category ID from route
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Get category
    const category = await service.getById(id)

    return sendSuccess(event, category)
  } catch (error) {
    throw handleError(error)
  }
})
