import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { z } from 'zod'
import { parseBody } from '../../../utils/response'
import { handleError } from '../../../utils/errors'
import { consensusRequestSchema } from '../../../domains/ai/ai.schema'
import { useAIService } from '../../../domains/ai/ai.service'

// =============================================================================
// POST /api/ai/consensus/evaluate
// Purpose: Single-provider consensus evaluation (for CRE workflow)
// Access: CRE workflow only
// =============================================================================

/**
 * POST /api/ai/consensus/evaluate
 *
 * Runs a single AI provider evaluation for consensus.
 * This endpoint is designed for the CRE workflow which orchestrates
 * parallel calls to multiple AI endpoints.
 *
 * @example
 * ```json
 * POST /api/ai/consensus/evaluate
 * {
 *   "provider": "anthropic",
 *   "campaign": { ... },
 *   "verificationType": "completion",
 *   "currentEvidence": [ ... ],
 *   "baselineData": { ... }
 * }
 * ```
 */
const evaluateRequestSchema = consensusRequestSchema.extend({
  provider: z.enum(['anthropic', 'openai', 'google']),
})

export default defineEventHandler(async (event) => {
  try {
    // TODO: Verify CRE webhook signature
    // await verifyCREWebhook(event, body)

    // Get API keys from runtime config (Cloudflare-compatible)
    const config = useRuntimeConfig(event)
    const apiKeys = {
      anthropic: config.anthropicApiKey as string,
      openai: config.openaiApiKey as string,
      google: config.googleAiApiKey as string,
    }

    // Parse and validate request body
    const input = await parseBody(event, evaluateRequestSchema)

    // Get AI service and run single-provider evaluation
    const aiService = useAIService()
    const result = await aiService.evaluateForConsensus(input, input.provider, apiKeys)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    throw handleError(error)
  }
})
