import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam, parseBody } from '../../utils/response'
import {
  createCategoryRepository,
  createCategoryService,
  updateCategorySchema,
} from '../../domains/categories'

/**
 * PUT /api/categories/:id
 * Update an existing category
 *
 * Path Parameters:
 * - id: string (category slug/ID)
 *
 * Request Body (all fields optional):
 * - name: string (2-100 chars)
 * - description: string (max 500 chars)
 * - icon: string
 * - color: string (hex color like #FF5733)
 * - parentCategoryId: string
 * - displayOrder: number
 * - isActive: boolean
 * - isFeatured: boolean
 *
 * @returns {ApiResponse<CategoryResponse>} Updated category
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get category ID from route
    const id = getRequiredParam(event, 'id')

    // Parse and validate request body
    const input = await parseBody(event, updateCategorySchema)

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Update category
    const category = await service.update(id, input)

    return sendSuccess(event, category)
  } catch (error) {
    throw handleError(error)
  }
})
