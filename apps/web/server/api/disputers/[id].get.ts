import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createDisputerRepository, createDisputerService } from '../../domains/disputers'

/**
 * GET /api/disputers/:id
 * Get a dispute by ID
 *
 * @param id - Dispute ID (path parameter)
 * @returns {ApiResponse<DisputerResponse>} The dispute details
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get dispute id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const repository = createDisputerRepository(DB)
    const service = createDisputerService({ disputerRepository: repository })

    // Get dispute
    const disputer = await service.getById(id)

    return sendSuccess(event, disputer)
  } catch (error) {
    throw handleError(error)
  }
})
