import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { respondNoContent, getRequiredParam } from '../../utils/response'
import { createCampaignRepository, createCampaignService } from '../../domains/campaigns'

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign (soft delete, creator only, draft status only)
 *
 * @param id - Campaign ID (path parameter)
 * @header X-Wallet-Address - Creator's wallet address (required)
 * @returns 204 No Content
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get campaign id from path params
    const id = getRequiredParam(event, 'id')

    // Get creator address from header
    const creatorAddress = requireWalletAddress(event)

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Delete campaign
    await service.delete(id, creatorAddress)

    return respondNoContent(event)
  } catch (error) {
    throw handleError(error)
  }
})
