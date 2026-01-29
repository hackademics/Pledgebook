import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createVoucherRepository,
  createVoucherService,
  listVouchersQuerySchema,
} from '../../domains/vouchers'
import { createCampaignRepository } from '../../domains/campaigns'

/**
 * GET /api/vouchers
 * List all vouchers with pagination, sorting, and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'amount' | 'vouched_at' | 'created_at'
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - campaignId: UUID (optional)
 * - voucherAddress: string (optional)
 * - status: voucher status (optional)
 *
 * @returns {ApiResponse<VoucherSummary[]>} Paginated list of vouchers
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listVouchersQuerySchema)

    // Initialize repositories and service
    const voucherRepository = createVoucherRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createVoucherService({ voucherRepository, campaignRepository })

    // Get paginated vouchers
    const { data, meta } = await service.getAll(query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
