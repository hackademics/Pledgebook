import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createCampaignRepository, createCampaignService } from '../../domains/campaigns'

/**
 * GET /api/campaigns/featured
 * Get featured campaigns
 *
 * @returns {ApiResponse<CampaignSummary[]>} List of featured campaigns
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Get featured campaigns
    const campaigns = await service.getFeatured(10)

    return sendSuccess(event, campaigns)
  } catch (error) {
    throw handleError(error)
  }
})
