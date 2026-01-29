import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, getRequiredParam } from '../../utils/response'
import { createVoucherRepository, createVoucherService } from '../../domains/vouchers'

/**
 * GET /api/vouchers/:id
 * Get a voucher by ID
 *
 * @param id - Voucher ID (UUID) (path parameter)
 * @returns {ApiResponse<VoucherResponse>} Voucher details
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const voucherRepository = createVoucherRepository(DB)
    const service = createVoucherService({ voucherRepository })

    // Get voucher
    const voucher = await service.getById(id)

    return sendSuccess(event, voucher)
  } catch (error) {
    throw handleError(error)
  }
})
