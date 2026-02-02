import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { parseBody } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { consensusRequestSchema } from '../../domains/ai/ai.schema'
import { useAIService } from '../../domains/ai/ai.service'

// =============================================================================
// POST /api/ai/consensus
// Purpose: Multi-AI consensus verification for campaign goal achievement
// Access: System/CRE callback only
// =============================================================================

/**
 * POST /api/ai/consensus
 *
 * Runs consensus verification across multiple AI providers (Claude, Gemini, GPT-4).
 * Returns aggregated verdict with individual provider votes.
 *
 * This endpoint can be called:
 * 1. Directly for testing/admin purposes
 * 2. By the CRE workflow for automated verification
 *
 * @example
 * ```json
 * POST /api/ai/consensus
 * {
 *   "campaign": {
 *     "id": "uuid",
 *     "name": "Weight Loss Challenge",
 *     "purpose": "Lose 20 lbs in 3 months",
 *     "rulesAndResolution": "Funds released on verified weight loss",
 *     "prompt": "Verify weight loss of ≥20lbs using Fitbit API...",
 *     "promptHash": "sha256...",
 *     "baselineData": { "weight": "200" },
 *     "fundraisingGoal": "1000000000000000000",
 *     "consensusThreshold": 0.66,
 *     "startDate": "2026-02-01",
 *     "endDate": "2026-05-01",
 *     "tags": [],
 *     "categories": ["Health"],
 *     "creatorAddress": "0x..."
 *   },
 *   "verificationType": "completion",
 *   "currentEvidence": [
 *     {
 *       "type": "private-api",
 *       "uri": "fitbit://weight/2026-05-01",
 *       "description": "Final weight reading: 178 lbs"
 *     }
 *   ],
 *   "baselineData": { "weight": "200", "date": "2026-02-01" }
 * }
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    // TODO: Add system/CRE authentication check
    // For CRE callbacks, verify the webhook signature
    // await verifyCREWebhook(event, body)

    // Get API keys from runtime config (Cloudflare-compatible)
    const config = useRuntimeConfig(event)
    const apiKeys = {
      anthropic: config.anthropicApiKey as string,
      openai: config.openaiApiKey as string,
      google: config.googleAiApiKey as string,
    }

    // Parse and validate request body
    const input = await parseBody(event, consensusRequestSchema)

    // Get AI service and run consensus verification
    const aiService = useAIService()
    const result = await aiService.runConsensusVerification(input, apiKeys)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    throw handleError(error)
  }
})
