import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError, ApiErrorCode, createApiError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { isAdminAddress } from '../../utils/admin'
import { sendSuccess, parseBody, getRequiredParam } from '../../utils/response'
import {
  createVoucherRepository,
  createVoucherService,
  updateVoucherSchema,
} from '../../domains/vouchers'

/**
 * PATCH /api/vouchers/:id
 * Update a voucher (status, release, slash, etc.)
 * Restricted to voucher owner or admin.
 *
 * @param id - Voucher ID (path parameter)
 * @header X-Wallet-Address - Wallet address (required, must be owner or admin)
 * @body UpdateVoucherInput - Fields to update
 * @returns {ApiResponse<VoucherResponse>} Updated voucher
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get authenticated wallet address
    const walletAddress = requireWalletAddress(event)

    // Get voucher id from path params
    const id = getRequiredParam(event, 'id')

    // Initialize repository and service
    const voucherRepository = createVoucherRepository(DB)
    const service = createVoucherService({ voucherRepository })

    // Get the voucher to verify ownership
    const existingVoucher = await service.getById(id)

    // Verify caller is owner or admin
    const isOwner = existingVoucher.voucherAddress.toLowerCase() === walletAddress.toLowerCase()
    const isAdmin = isAdminAddress(event, walletAddress)

    if (!isOwner && !isAdmin) {
      throw createApiError(ApiErrorCode.FORBIDDEN, "Cannot update another user's voucher")
    }

    // Parse and validate request body
    const input = await parseBody(event, updateVoucherSchema)

    // Update voucher
    const voucher = await service.update(id, input)

    return sendSuccess(event, voucher)
  } catch (error) {
    throw handleError(error)
  }
})
