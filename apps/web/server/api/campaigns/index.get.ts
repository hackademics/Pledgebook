import { defineEventHandler } from 'h3'
import { useCloudflare, useCloudflareOptional } from '../../utils/cloudflare'
import { handleError } from '../../utils/errors'
import { sendSuccess, parseQuery } from '../../utils/response'
import {
  createCampaignRepository,
  createCampaignService,
  listCampaignsQuerySchema,
} from '../../domains/campaigns'

/**
 * GET /api/campaigns
 * List all campaigns with pagination, sorting, and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'created_at' | 'end_date' | 'amount_pledged' | 'pledge_count' | 'name'
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - status: campaign status filter
 * - creatorAddress: filter by creator
 * - isShowcased: boolean (optional)
 * - isFeatured: boolean (optional)
 * - isVerified: boolean (optional)
 * - category: string (optional)
 * - search: string (optional)
 *
 * @returns {ApiResponse<CampaignSummary[]>} Paginated list of campaigns
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)
    const cloudflare = useCloudflareOptional(event)

    // Parse and validate query parameters
    const query = parseQuery(event, listCampaignsQuerySchema)

    const cacheKey = `campaigns:${JSON.stringify(query)}`
    const cache = cloudflare?.CACHE
    if (cache) {
      const cached = await cache.get(cacheKey, 'json')
      if (cached && typeof cached === 'object' && 'data' in cached && 'meta' in cached) {
        return sendSuccess(
          event,
          (cached as { data: unknown }).data as unknown,
          (cached as { meta: Record<string, unknown> }).meta,
        )
      }
    }

    // Initialize repository and service
    const repository = createCampaignRepository(DB)
    const service = createCampaignService(repository)

    // Get paginated campaigns
    const { data, meta } = await service.getAll(query)

    if (cache) {
      await cache.put(cacheKey, JSON.stringify({ data, meta }), {
        expirationTtl: 60,
      })
    }

    return sendSuccess(event, data, meta)
  } catch (error) {
    throw handleError(error)
  }
})
