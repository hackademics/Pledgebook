import { defineEventHandler } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendCreated, parseBody } from '../../utils/response'
import {
  createVoucherRepository,
  createVoucherService,
  createVoucherSchema,
} from '../../domains/vouchers'
import { createCampaignRepository } from '../../domains/campaigns'

/**
 * POST /api/vouchers
 * Create a new voucher (endorsement)
 *
 * @body CreateVoucherInput - Voucher data
 * @header X-Wallet-Address - Voucher's wallet address (required)
 * @returns {ApiResponse<VoucherResponse>} Created voucher
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)

    // Get voucher address from header
    const voucherAddress = event.node.req.headers['x-wallet-address'] as string
    if (!voucherAddress) {
      throw new Error('Missing X-Wallet-Address header')
    }

    // Parse and validate request body
    const input = await parseBody(event, createVoucherSchema)

    // Initialize repositories and service
    const voucherRepository = createVoucherRepository(DB)
    const campaignRepository = createCampaignRepository(DB)
    const service = createVoucherService({ voucherRepository, campaignRepository })

    // Create voucher
    const voucher = await service.create(voucherAddress, input)

    return sendCreated(event, voucher)
  } catch (error) {
    throw handleError(error)
  }
})
