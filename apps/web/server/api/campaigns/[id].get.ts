import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createCampaignRepository, createCampaignService } from '../../domains/campaigns'

/**
 * GET /api/campaigns/:id
 * Get a campaign by ID or slug
 *
 * @param id - Campaign ID (UUID) or slug (path parameter)
 * @returns {ApiResponse<CampaignResponse>} Campaign details
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Try to get by UUID first, then by slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const campaign = isUuid ? await service.getById(id) : await service.getBySlug(id)

    return sendSuccess(event, campaign)
  } catch (error) {
    throw handleError(error)
  }
})
