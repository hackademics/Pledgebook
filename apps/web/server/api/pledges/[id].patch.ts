import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError, ApiErrorCode, createApiError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { isAdminAddress } from '../../utils/admin'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createPledgeRepository,
  createPledgeService,
  updatePledgeSchema,
} from '../../domains/pledges'

/**
 * PATCH /api/pledges/:id
 * Update a pledge (status, confirmations, etc.)
 * Restricted to pledge owner or admin.
 *
 * @param id - Pledge ID (path parameter)
 * @header X-Wallet-Address - Wallet address (required, must be owner or admin)
 * @body UpdatePledgeInput - Fields to update
 * @returns {ApiResponse<PledgeResponse>} Updated pledge
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get authenticated wallet address
    const walletAddress = requireWalletAddress(event)

    // Get pledge id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const pledgeRepository = createPledgeRepository(DB)
    const service = createPledgeService({ pledgeRepository })

    // Get the pledge to verify ownership
    const existingPledge = await service.getById(id)

    // Verify caller is owner or admin
    const isOwner = existingPledge.pledgerAddress.toLowerCase() === walletAddress.toLowerCase()
    const isAdmin = isAdminAddress(event, walletAddress)

    if (!isOwner && !isAdmin) {
      throw createApiError(ApiErrorCode.FORBIDDEN, "Cannot update another user's pledge")
    }

    // Parse and validate request body
    const input = await parseBody(event, updatePledgeSchema)

    // Update pledge
    const pledge = await service.update(id, input)

    return sendSuccess(event, pledge)
  } catch (error) {
    throw handleError(error)
  }
})
