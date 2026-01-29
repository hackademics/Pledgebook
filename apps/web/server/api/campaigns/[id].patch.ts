import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createCampaignRepository,
  createCampaignService,
  updateCampaignSchema,
} from '../../domains/campaigns'

/**
 * PATCH /api/campaigns/:id
 * Update a campaign (creator only, draft status only)
 *
 * @param id - Campaign ID (path parameter)
 * @header X-Wallet-Address - Creator's wallet address (required)
 * @body UpdateCampaignInput - Fields to update
 * @returns {ApiResponse<CampaignResponse>} Updated campaign
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get campaign id from path params
    const id = getRequiredParam(event, 'id')

    // Get creator address from header
    const creatorAddress = event.node.req.headers['x-wallet-address'] as string
    if (!creatorAddress) {
      throw new Error('Missing X-Wallet-Address header')
    }

    // Parse and validate request body
    const input = await parseBody(event, updateCampaignSchema)

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Update campaign
    const campaign = await service.update(id, creatorAddress, input)

    return sendSuccess(event, campaign)
  } catch (error) {
    throw handleError(error)
  }
})
