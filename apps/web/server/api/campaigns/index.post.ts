import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { requireTurnstile } from '../../utils/turnstile'
import { sendCreated, parseBody } from '../../utils/response'
import {
  createCampaignRepository,
  createCampaignService,
  createCampaignSchema,
} from '../../domains/campaigns'

/**
 * POST /api/campaigns
 * Create a new campaign
 *
 * @body CreateCampaignInput - Campaign data
 * @header X-Wallet-Address - Creator's wallet address (required)
 * @returns {ApiResponse<CampaignResponse>} Created campaign
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    await requireTurnstile(event)

    // Get creator address from header (in production, this would be from auth)
    const creatorAddress = requireWalletAddress(event)

    // Parse and validate request body
    const input = await parseBody(event, createCampaignSchema)

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Create campaign
    const campaign = await service.create(creatorAddress, input)

    return sendCreated(event, campaign)
  } catch (error) {
    throw handleError(error)
  }
})
