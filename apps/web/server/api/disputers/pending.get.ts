import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { createDisputerRepository, createDisputerService } from '../../domains/disputers'

/**
 * GET /api/disputers/pending
 * Get pending disputes (admin view)
 *
 * @returns {ApiResponse<DisputerSummary[]>} List of pending disputes
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // TODO: Verify caller has admin/verifier role

    // Initialize repository and service
    const repository = createDisputerRepository(DB)
    const service = createDisputerService({ disputerRepository: repository })

    // Get pending disputes
    const disputers = await service.getPending()

    return sendSuccess(event, disputers)
  } catch (error) {
    throw handleError(error)
  }
})
