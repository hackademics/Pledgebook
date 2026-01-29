import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createPledgeRepository,
  createPledgeService,
  listPledgesQuerySchema,
} from '../../domains/pledges'
import { createCampaignRepository } from '../../domains/campaigns'
import { createUserRepository } from '../../domains/users'

/**
 * GET /api/pledges
 * List all pledges with pagination, sorting, and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'amount' | 'pledged_at' | 'created_at'
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - campaignId: UUID (optional)
 * - pledgerAddress: string (optional)
 * - status: pledge status (optional)
 *
 * @returns {ApiResponse<PledgeSummary[]>} Paginated list of pledges
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listPledgesQuerySchema)

    // Initialize repositories and service
    const pledgeRepository = createPledgeRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const userRepository = createUserRepository(DB)
    const service = createPledgeService({ pledgeRepository, campaignRepository, userRepository })

    // Get paginated pledges
    const { data, meta } = await service.getAll(query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
