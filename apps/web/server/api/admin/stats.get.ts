import { defineEventHandler, getHeader, createError } from 'h3'
import { useCloudflare } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess } from '../../utils/response'
import { isAdminAddress } from '../../utils/admin'
import { createLogger } from '../../utils/logger'

const logger = createLogger('admin:stats')

/**
 * GET /api/admin/stats
 * Returns platform-wide statistics for the admin dashboard.
 * Requires authenticated admin wallet.
 */
export default defineEventHandler(async (event) => {
  try {
    const walletAddress = event.context.auth?.address || getHeader(event, 'x-wallet-address')

    if (
      !walletAddress ||
      typeof walletAddress !== 'string' ||
      !isAdminAddress(event, walletAddress)
    ) {
      throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }

    const { DB } = useCloudflare(event)

    // Run all stat queries in parallel
    const [pendingResult, verifiedResult, disputeResult, featuredResult, velocityResult] =
      await Promise.all([
        DB.prepare(
          `SELECT COUNT(*) as count FROM campaigns WHERE status = 'pending_review'`,
        ).first<{ count: number }>(),
        DB.prepare(`SELECT COUNT(*) as count FROM campaigns WHERE is_verified = 1`).first<{
          count: number
        }>(),
        DB.prepare(`SELECT COUNT(*) as count FROM disputers WHERE status = 'active'`).first<{
          count: number
        }>(),
        DB.prepare(`SELECT COUNT(*) as count FROM campaigns WHERE is_featured = 1`).first<{
          count: number
        }>(),
        DB.prepare(
          `SELECT COALESCE(SUM(CAST(amount_pledged AS REAL)), 0) as total FROM campaigns WHERE status = 'active'`,
        ).first<{ total: number }>(),
      ])

    const stats = {
      pendingReviews: pendingResult?.count ?? 0,
      verifiedCampaigns: verifiedResult?.count ?? 0,
      openDisputes: disputeResult?.count ?? 0,
      featuredSlots: featuredResult?.count ?? 0,
      pledgeVelocity: velocityResult?.total ?? 0,
    }

    logger.info('Admin stats fetched', { wallet: walletAddress })

    return sendSuccess(event, stats)
  } catch (error) {
    throw handleError(error)
  }
})
