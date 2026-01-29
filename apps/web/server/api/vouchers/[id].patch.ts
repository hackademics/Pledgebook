import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createVoucherRepository,
  createVoucherService,
  updateVoucherSchema,
} from '../../domains/vouchers'

/**
 * PATCH /api/vouchers/:id
 * Update a voucher (status, release, slash, etc.)
 *
 * @param id - Voucher ID (path parameter)
 * @body UpdateVoucherInput - Fields to update
 * @returns {ApiResponse<VoucherResponse>} Updated voucher
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get voucher id from path params
    const id = getRequiredParam(event, 'id')

    // Parse and validate request body
    const input = await parseBody(event, updateVoucherSchema)

    // Initialize repository and service
    const voucherRepository = createVoucherRepository(DB)
    const service = createVoucherService({ voucherRepository })

    // Update voucher
    const voucher = await service.update(id, input)

    return sendSuccess(event, voucher)
  } catch (error) {
    throw handleError(error)
  }
})
