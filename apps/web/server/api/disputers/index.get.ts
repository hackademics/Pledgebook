import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createDisputerRepository,
  createDisputerService,
  listDisputersQuerySchema,
} from '../../domains/disputers'

/**
 * GET /api/disputers
 * List disputers with pagination and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'amount' | 'disputed_at' | 'created_at'
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - campaignId: UUID (optional)
 * - disputerAddress: string (optional)
 * - status: disputer status (optional)
 * - disputeType: dispute type (optional)
 *
 * @returns {ApiResponse<DisputerSummary[]>} Paginated list of disputes
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listDisputersQuerySchema)

    // Initialize repository and service
    const repository = createDisputerRepository(DB)
    const service = createDisputerService({ disputerRepository: repository })

    // Get paginated disputes
    const { data, meta } = await service.getAll(query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
