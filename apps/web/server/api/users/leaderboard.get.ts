import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createUserRepository, createUserService } from '../../domains/users'

/**
 * GET /api/users/leaderboard
 * Get top users by reputation score
 *
 * Query Parameters:
 * - limit: number (default: 10, max: 100)
 *
 * @returns {ApiResponse<UserProfileResponse[]>} List of top users
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Get leaderboard
    const users = await service.getLeaderboard(10)

    return sendSuccess(event, users)
  } catch (error) {
    throw handleError(error)
  }
})
