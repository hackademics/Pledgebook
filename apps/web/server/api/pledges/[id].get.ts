import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createPledgeRepository, createPledgeService } from '../../domains/pledges'

/**
 * GET /api/pledges/:id
 * Get a pledge by ID
 *
 * @param id - Pledge ID (UUID) (path parameter)
 * @returns {ApiResponse<PledgeResponse>} Pledge details
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const pledgeRepository = createPledgeRepository(DB)
    const service = createPledgeService({ pledgeRepository })

    // Get pledge
    const pledge = await service.getById(id)

    return sendSuccess(event, pledge)
  } catch (error) {
    throw handleError(error)
  }
})
