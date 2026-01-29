import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError } from '../../../utils/errors'
import { sendSuccess, parseQuery, getRequiredParam } from '../../../utils/response'
import {
  createPledgeRepository,
  createPledgeService,
  listPledgesQuerySchema,
} from '../../../domains/pledges'
import { createCampaignRepository } from '../../../domains/campaigns'

/**
 * GET /api/campaigns/:campaignId/pledges
 * Get pledges for a specific campaign
 *
 * @param campaignId - Campaign ID (path parameter)
 * @returns {ApiResponse<PledgeSummary[]>} Paginated list of pledges
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get campaign id from path params
    const campaignId = getRequiredParam(event, 'campaignId')

    // Parse and validate query parameters
    const query = parseQuery(event, listPledgesQuerySchema)

    // Initialize repositories and service
    const pledgeRepository = createPledgeRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createPledgeService({ pledgeRepository, campaignRepository })

    // Get pledges for campaign
    const { data, meta } = await service.getByCampaign(campaignId, query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
