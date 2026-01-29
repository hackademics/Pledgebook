import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { respondNoContent, getRequiredParam } from '../../utils/response'
import { createCategoryRepository, createCategoryService } from '../../domains/categories'

/**
 * DELETE /api/categories/:id
 * Delete a category
 *
 * Path Parameters:
 * - id: string (category slug/ID)
 *
 * Note: Will fail if category has child categories (must delete children first)
 *
 * @returns 204 No Content on success
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get category ID from route
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Delete category
    await service.delete(id)

    respondNoContent(event)
    return null
  } catch (error) {
    throw handleError(error)
  }
})
