import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError } from '../../../utils/errors'
import { sendSuccess, parseQuery, getRequiredParam } from '../../../utils/response'
import {
  createVoucherRepository,
  createVoucherService,
  listVouchersQuerySchema,
} from '../../../domains/vouchers'
import { createCampaignRepository } from '../../../domains/campaigns'

/**
 * GET /api/campaigns/:campaignId/vouchers
 * Get vouchers for a specific campaign
 *
 * @param campaignId - Campaign ID (path parameter)
 * @returns {ApiResponse<VoucherSummary[]>} Paginated list of vouchers
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get campaign id from path params
    const campaignId = getRequiredParam(event, 'campaignId')

    // Parse and validate query parameters
    const query = parseQuery(event, listVouchersQuerySchema)

    // Initialize repositories and service
    const voucherRepository = createVoucherRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createVoucherService({ voucherRepository, campaignRepository })

    // Get vouchers for campaign
    const { data, meta } = await service.getByCampaign(campaignId, query)

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
