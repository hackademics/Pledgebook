import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendCreated, parseBody } from '../../utils/response'
import { requireWalletAddress } from '../../utils/auth'
import { requireTurnstile } from '../../utils/turnstile'
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

    await requireTurnstile(event)

    // Parse and validate request body
    const body = await parseBody(event, createDisputerSchema)

    // Get disputer address from authenticated SIWE session (or header fallback in dev)
    const disputerAddress = requireWalletAddress(event)

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
