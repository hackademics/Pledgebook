import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendCreated, parseBody } from '../../utils/response'
import {
  createPledgeRepository,
  createPledgeService,
  createPledgeSchema,
} from '../../domains/pledges'
import { createCampaignRepository } from '../../domains/campaigns'
import { createUserRepository } from '../../domains/users'

/**
 * POST /api/pledges
 * Create a new pledge
 *
 * @body CreatePledgeInput - Pledge data
 * @header X-Wallet-Address - Pledger's wallet address (required)
 * @returns {ApiResponse<PledgeResponse>} Created pledge
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get pledger address from header
    const pledgerAddress = event.node.req.headers['x-wallet-address'] as string
    if (!pledgerAddress) {
      throw new Error('Missing X-Wallet-Address header')
    }

    // Parse and validate request body
    const input = await parseBody(event, createPledgeSchema)

    // Initialize repositories and service
    const pledgeRepository = createPledgeRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const userRepository = createUserRepository(DB)
    const service = createPledgeService({ pledgeRepository, campaignRepository, userRepository })

    // Create pledge
    const pledge = await service.create(pledgerAddress, input)

    return sendCreated(event, pledge)
  } catch (error) {
    throw handleError(error)
  }
})
