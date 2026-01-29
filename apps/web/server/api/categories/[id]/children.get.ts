import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError } from '../../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../../utils/response'
import { createCategoryRepository, createCategoryService } from '../../../domains/categories'

/**
 * GET /api/categories/:id/children
 * Get all child categories of a parent category
 *
 * Path Parameters:
 * - id: string (parent category slug/ID)
 *
 * @returns {ApiResponse<CategoryResponse[]>} List of child categories
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get parent category ID from route
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Get children
    const children = await service.getChildren(id)

    return sendSuccess(event, children)
  } catch (error) {
    throw handleError(error)
  }
})
