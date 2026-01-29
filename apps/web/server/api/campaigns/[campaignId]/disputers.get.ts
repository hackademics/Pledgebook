import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError } from '../../../utils/errors'
import { sendSuccess, parseQuery, getRequiredParam } from '../../../utils/response'
import {
  createDisputerRepository,
  createDisputerService,
  listDisputersQuerySchema,
} from '../../../domains/disputers'
import { createCampaignRepository } from '../../../domains/campaigns'

/**
 * GET /api/campaigns/:campaignId/disputers
 * Get disputes for a specific campaign
 *
 * @param campaignId - Campaign ID (path parameter)
 * @returns {ApiResponse<DisputerSummary[]>} Paginated list of disputes
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get campaign id from path params
    const campaignId = getRequiredParam(event, 'campaignId')

    // Parse and validate query parameters
    const query = parseQuery(event, listDisputersQuerySchema)

    // Initialize repositories and service
    const disputerRepository = createDisputerRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createDisputerService({ disputerRepository, campaignRepository })

    // Get disputes for campaign
    const { data, meta } = await service.getByCampaign(campaignId, query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
