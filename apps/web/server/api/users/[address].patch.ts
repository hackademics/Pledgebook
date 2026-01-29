import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import { createUserRepository, createUserService, updateUserSchema } from '../../domains/users'

/**
 * PATCH /api/users/:address
 * Update a user's profile
 *
 * @param address - Ethereum wallet address (path parameter)
 * @body UpdateUserInput - Fields to update
 * @returns {ApiResponse<UserResponse>} Updated user
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get address from path params
    const address = getRequiredParam(event, 'address')

    // Parse and validate request body
    const input = await parseBody(event, updateUserSchema)

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Update user
    const user = await service.update(address, input)

    return sendSuccess(event, user)
  } catch (error) {
    throw handleError(error)
  }
})
