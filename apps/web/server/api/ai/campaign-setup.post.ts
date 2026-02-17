import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { campaignSetupHelpRequestSchema } from '../../domains/ai/ai.schema'
import { useAIService } from '../../domains/ai/ai.service'

// =============================================================================
// POST /api/ai/campaign-setup
// Purpose: AI-powered campaign creation assistance
// Access: Authenticated users
// =============================================================================

/**
 * POST /api/ai/campaign-setup
 *
 * Helps users create valid, consensus-ready campaigns.
 * Evaluates SMART criteria, refines prompts, and recommends data sources.
 *
 * @example
 * ```json
 * POST /api/ai/campaign-setup
 * {
 *   "name": "My Weight Loss Journey",
 *   "purpose": "I want to lose 20 pounds over the next 3 months",
 *   "rulesAndResolution": "Funds released when I hit my target weight",
 *   "prompt": "Check if I lost 20 pounds",
 *   "fundraisingGoal": "1000000000000000000",
 *   "endDate": "2026-05-01",
 *   "tags": ["health", "weight-loss"],
 *   "categories": ["Health"],
 *   "evidence": [
 *     { "type": "private-api", "uri": "fitbit", "description": "Fitbit weight data" }
 *   ]
 * }
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authenticated user - throws if not authorized
    requireWalletAddress(event)

    // Get API keys from runtime config (Cloudflare-compatible)
    const config = useRuntimeConfig(event)
    const apiKeys = {
      anthropic: config.anthropicApiKey as string,
      openai: config.openaiApiKey as string,
      google: config.googleAiApiKey as string,
    }

    // Parse and validate request body
    const input = await parseBody(event, campaignSetupHelpRequestSchema)

    // Get AI service and run setup assistance
    const aiService = useAIService()
    const result = await aiService.helpCampaignSetup(input, apiKeys)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    throw handleError(error)
  }
})
