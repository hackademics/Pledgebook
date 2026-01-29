import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import { createUserRepository, createUserService, listUsersQuerySchema } from '../../domains/users'

/**
 * GET /api/users
 * List all users with pagination, sorting, and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'reputation_score' | 'campaigns_created' | 'pledges_made' | 'created_at' | 'last_active_at'
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - role: 'user' | 'admin' | 'verifier' (optional)
 * - isActive: boolean (optional)
 * - isBanned: boolean (optional)
 * - search: string (optional, searches address, display_name, ens_name)
 *
 * @returns {ApiResponse<UserResponse[]>} Paginated list of users
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listUsersQuerySchema)

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Get paginated users
    const { data, meta } = await service.getAll(query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
