import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createUserRepository, createUserService } from '../../domains/users'

/**
 * GET /api/users/:address
 * Get a user's public profile by wallet address
 *
 * @param address - Ethereum wallet address (path parameter)
 * @returns {ApiResponse<UserProfileResponse>} User's public profile
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get address from path params
    const address = getRequiredParam(event, 'address')

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Get user profile (respects privacy mode)
    const profile = await service.getProfileByAddress(address)

    return sendSuccess(event, profile)
  } catch (error) {
    throw handleError(error)
  }
})
