import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createPledgeRepository,
  createPledgeService,
  updatePledgeSchema,
} from '../../domains/pledges'

/**
 * PATCH /api/pledges/:id
 * Update a pledge (status, confirmations, etc.)
 *
 * @param id - Pledge ID (path parameter)
 * @body UpdatePledgeInput - Fields to update
 * @returns {ApiResponse<PledgeResponse>} Updated pledge
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get pledge id from path params
    const id = getRequiredParam(event, 'id')

    // Parse and validate request body
    const input = await parseBody(event, updatePledgeSchema)

    // Initialize repository and service
    const pledgeRepository = createPledgeRepository(DB)
    const service = createPledgeService({ pledgeRepository })

    // Update pledge
    const pledge = await service.update(id, input)

    return sendSuccess(event, pledge)
  } catch (error) {
    throw handleError(error)
  }
})
