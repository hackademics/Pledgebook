import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody } from '../../utils/response'
import { createUserRepository, createUserService, createUserSchema } from '../../domains/users'

/**
 * POST /api/users
 * Create a new user or record login
 *
 * @body CreateUserInput - User data with wallet address
 * @returns {ApiResponse<UserResponse>} Created or existing user
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate request body
    const input = await parseBody(event, createUserSchema)

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Record login (creates user if not exists)
    const user = await service.recordLogin(input.address)

    return sendSuccess(event, user)
  } catch (error) {
    throw handleError(error)
  }
})
