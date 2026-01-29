import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendCreated, parseBody } from '../../utils/response'
import {
  createCategoryRepository,
  createCategoryService,
  createCategorySchema,
} from '../../domains/categories'

/**
 * POST /api/categories
 * Create a new category
 *
 * Request Body:
 * - id: string (required, kebab-case slug)
 * - name: string (required, 2-100 chars)
 * - description: string (optional, max 500 chars)
 * - icon: string (optional)
 * - color: string (optional, hex color like #FF5733)
 * - parentCategoryId: string (optional)
 * - displayOrder: number (optional, default: 0)
 * - isActive: boolean (optional, default: true)
 * - isFeatured: boolean (optional, default: false)
 *
 * @returns {ApiResponse<CategoryResponse>} Created category
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate request body
    const input = await parseBody(event, createCategorySchema)

    // Initialize repository and service
    const repository = createCategoryRepository(DB)
    const service = createCategoryService(repository)

    // Create category
    const category = await service.create(input)

    return sendCreated(event, category)
  } catch (error) {
    throw handleError(error)
  }
})
