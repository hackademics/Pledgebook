import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { useCloudflare } from '../../../utils/cloudflare'
import { handleError, ApiErrorCode, createApiError } from '../../../utils/errors'
import { requireWalletAddress } from '../../../utils/auth'
import { sendSuccess, parseBody, getRequiredParam } from '../../../utils/response'
import {
  createCampaignRepository,
  createCampaignService,
  adminUpdateCampaignSchema,
} from '../../../domains/campaigns'

/**
 * PATCH /api/campaigns/:id/admin
 * Admin update for campaign status and spotlight flags
 *
 * @param id - Campaign ID (path parameter)
 * @header X-Wallet-Address - Admin wallet address (required)
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)
    const { adminWalletAllowlist } = useRuntimeConfig(event)

    const adminAddress = requireWalletAddress(event)
    const allowlist = String(adminWalletAllowlist || '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)

    if (allowlist.length === 0) {
      throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'Admin allowlist not configured')
    }

    if (!allowlist.includes(adminAddress.toLowerCase())) {
      throw createApiError(ApiErrorCode.FORBIDDEN, 'Admin access required')
    }

    const id = getRequiredParam(event, 'id')
    const input = await parseBody(event, adminUpdateCampaignSchema)

    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    const campaign = await service.adminUpdate(id, input)

    return sendSuccess(event, campaign)
  } catch (error) {
    throw handleError(error)
  }
})
