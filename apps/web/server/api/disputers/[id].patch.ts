import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createDisputerRepository,
  createDisputerService,
  updateDisputerSchema,
} from '../../domains/disputers'

/**
 * PATCH /api/disputers/:id
 * Update a dispute
 *
 * @param id - Dispute ID (path parameter)
 * @returns {ApiResponse<DisputerResponse>} The updated dispute
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get dispute id from path params
    const id = getRequiredParam(event, 'id')

    // Parse and validate request body
    const body = await parseBody(event, updateDisputerSchema)

    // Initialize repository and service
    const repository = createDisputerRepository(DB)
    const service = createDisputerService({ disputerRepository: repository })

    // Update dispute
    const disputer = await service.update(id, body)

    return sendSuccess(event, disputer)
  } catch (error) {
    throw handleError(error)
  }
})
