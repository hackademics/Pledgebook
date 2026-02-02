import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { campaignApprovalRequestSchema } from '../../domains/ai/ai.schema'
import { useAIService } from '../../domains/ai/ai.service'

// =============================================================================
// POST /api/ai/campaign-approval
// Purpose: AI-powered campaign approval analysis
// Access: Admin/System only
// =============================================================================

/**
 * POST /api/ai/campaign-approval
 *
 * Analyzes a campaign submission for fraud, policy compliance, and quality.
 * Returns a decision (approved/rejected/needs_review) with detailed reasoning.
 *
 * @example
 * ```json
 * POST /api/ai/campaign-approval
 * {
 *   "campaign": {
 *     "id": "uuid",
 *     "name": "Weight Loss Challenge",
 *     "purpose": "Track my 20lb weight loss journey",
 *     "rulesAndResolution": "Funds released when goal verified",
 *     "prompt": "Verify 20lb weight loss using Fitbit data",
 *     "promptHash": "sha256...",
 *     "baselineData": {},
 *     "fundraisingGoal": "1000000000000000000",
 *     "consensusThreshold": 0.66,
 *     "startDate": "2026-02-01",
 *     "endDate": "2026-05-01",
 *     "tags": ["health", "fitness"],
 *     "categories": ["Health"],
 *     "creatorAddress": "0x..."
 *   },
 *   "strictMode": false
 * }
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    // TODO: Add admin/system authentication check
    // const { isAdmin } = await requireAuth(event)
    // if (!isAdmin) {
    //   throw createApiError(ApiErrorCode.FORBIDDEN, 'Admin access required')
    // }

    // Get API keys from runtime config (Cloudflare-compatible)
    const config = useRuntimeConfig(event)
    const apiKeys = {
      anthropic: config.anthropicApiKey as string,
      openai: config.openaiApiKey as string,
      google: config.googleAiApiKey as string,
    }

    // Parse and validate request body
    const input = await parseBody(event, campaignApprovalRequestSchema)

    // Get AI service and run approval analysis
    const aiService = useAIService()
    const result = await aiService.analyzeCampaignApproval(input, apiKeys)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    throw handleError(error)
  }
})
