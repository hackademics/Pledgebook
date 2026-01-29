import { defineEventHandler, getHeader } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendCreated, parseBody } from '../../utils/response'
import {
  createDisputerRepository,
  createDisputerService,
  createDisputerSchema,
} from '../../domains/disputers'
import { createCampaignRepository } from '../../domains/campaigns'

/**
 * POST /api/disputers
 * Create a new dispute
 *
 * @returns {ApiResponse<DisputerResponse>} The created dispute
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate request body
    const body = await parseBody(event, createDisputerSchema)

    // TODO: Get disputer address from authenticated session
    const disputerAddress = getHeader(event, 'x-wallet-address')
    if (!disputerAddress) {
      throw handleError(new Error('Authentication required'))
    }

    // Initialize repositories and service
    const disputerRepository = createDisputerRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createDisputerService({ disputerRepository, campaignRepository })

    // Create dispute
    const disputer = await service.create(disputerAddress, body)

    return sendCreated(event, disputer)
  } catch (error) {
    throw handleError(error)
  }
})
