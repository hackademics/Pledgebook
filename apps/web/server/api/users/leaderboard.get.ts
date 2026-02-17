import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createUserRepository, createUserService } from '../../domains/users'

const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

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

    const query = leaderboardQuerySchema.parse(getQuery(event))

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Get leaderboard
    const users = await service.getLeaderboard(query.limit)

    return sendSuccess(event, users)
  } catch (error) {
    throw handleError(error)
  }
})
