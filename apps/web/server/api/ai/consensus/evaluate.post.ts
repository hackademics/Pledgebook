import { defineEventHandler, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import { z } from 'zod'
import { handleError } from '../../../utils/errors'
import { consensusRequestSchema } from '../../../domains/ai/ai.schema'
import { useAIService } from '../../../domains/ai/ai.service'
import { verifyCREWebhook } from '../../../utils/cre'

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
    // Read raw body for signature verification
    const rawBody = (await readRawBody(event)) || ''

    // Verify CRE webhook signature - this endpoint is CRE workflow only
    await verifyCREWebhook(event, rawBody)

    // Get API keys from runtime config (Cloudflare-compatible)
    const config = useRuntimeConfig(event)
    const apiKeys = {
      anthropic: config.anthropicApiKey as string,
      openai: config.openaiApiKey as string,
      google: config.googleAiApiKey as string,
    }

    // Parse and validate request body (already read above)
    const input = evaluateRequestSchema.parse(JSON.parse(rawBody))

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
