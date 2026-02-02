import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError, ApiErrorCode, createApiError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import { createUserRepository, createUserService, updateUserSchema } from '../../domains/users'

/**
 * PATCH /api/users/:address
 * Update a user's profile
 *
 * @param address - Ethereum wallet address (path parameter)
 * @header X-Wallet-Address - Authenticated user's wallet address (required, must match path param)
 * @body UpdateUserInput - Fields to update
 * @returns {ApiResponse<UserResponse>} Updated user
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get authenticated wallet address
    const authenticatedAddress = requireWalletAddress(event)

    // Get target address from path params
    const targetAddress = getRequiredParam(event, 'address')

    // Verify ownership: user can only update their own profile
    if (authenticatedAddress.toLowerCase() !== targetAddress.toLowerCase()) {
      throw createApiError(ApiErrorCode.FORBIDDEN, "Cannot update another user's profile")
    }

    // Parse and validate request body
    const input = await parseBody(event, updateUserSchema)

    // Initialize repository and service
    const repository = createUserRepository(DB)
    const service = createUserService(repository)

    // Update user
    const user = await service.update(targetAddress, input)

    return sendSuccess(event, user)
  } catch (error) {
    throw handleError(error)
  }
})
