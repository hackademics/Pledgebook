import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError } from '../../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../../utils/response'
import { requireAdmin } from '../../../utils/admin'
import {
  createDisputerRepository,
  createDisputerService,
  resolveDisputerSchema,
} from '../../../domains/disputers'

/**
 * POST /api/disputers/:id/resolve
 * Resolve a dispute (admin/verifier action)
 *
 * @param id - Dispute ID (path parameter)
 * @returns {ApiResponse<DisputerResponse>} The resolved dispute
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get dispute id from path params
    const id = getRequiredParam(event, 'id')

    // Parse and validate request body
    const body = await parseBody(event, resolveDisputerSchema)

    // Require admin role - throws if not authorized
    const resolverAddress = requireAdmin(event)

    // Initialize repository and service
    const repository = createDisputerRepository(DB)
    const service = createDisputerService({ disputerRepository: repository })

    // Resolve the dispute
    const disputer = await service.resolve(id, resolverAddress, body)

    return sendSuccess(event, disputer)
  } catch (error) {
    throw handleError(error)
  }
})
