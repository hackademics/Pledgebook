import { defineEventHandler, getHeader, readRawBody } from 'h3'
import { z } from 'zod'
import { useRuntimeConfig } from '#imports'
import { handleError, createApiError, ApiErrorCode } from '../../utils/errors'
import { verifyCREWebhook } from '../../utils/cre'
import { isAdminAddress } from '../../utils/admin'
import { createLogger } from '../../utils/logger'

const logger = createLogger('vision-verify')

// =============================================================================
// POST /api/ai/vision-verify
// Purpose: Vision AI verification endpoint for CRE image-based consensus
// Access: CRE callback or admin only
// =============================================================================

/**
 * Request schema for vision verification
 */
const visionVerifyRequestSchema = z.object({
  baseline_image_url: z.string().url(),
  completion_image_url: z.string().url(),
  verification_criteria: z.object({
    target_text: z.string().min(1),
    baseline_count: z.number().int().min(0),
    required_count: z.number().int().min(1),
  }),
  campaign_id: z.string().uuid(),
  request_id: z.string().uuid(),
})

/**
 * Response schema for vision verification
 */
export type VisionVerifyResponse = {
  baseline_count: number
  completion_count: number
  meets_criteria: boolean
  confidence: number
  reasoning: string
  score: number
}

/**
 * Build the vision AI prompt for image verification
 */
function buildVisionPrompt(criteria: {
  target_text: string
  baseline_count: number
  required_count: number
}): string {
  return `You are an AI verifier for a pledge campaign. Your task is to compare two images and verify completion of a pledge.

BASELINE IMAGE: [Image 1]
This shows the initial state before the pledge was completed.

COMPLETION IMAGE: [Image 2]
This should show the completed pledge.

VERIFICATION CRITERIA:
- Target text: "${criteria.target_text}"
- Baseline should show approximately ${criteria.baseline_count} instance(s)
- Completion should show at least ${criteria.required_count} instances

INSTRUCTIONS:
1. Count the number of times "${criteria.target_text}" appears in the BASELINE image
2. Count the number of times "${criteria.target_text}" appears in the COMPLETION image
3. Verify the completion count meets or exceeds ${criteria.required_count}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "baseline_count": <number>,
  "completion_count": <number>,
  "meets_criteria": <boolean>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}`
}

/**
 * Call OpenAI GPT-4 Vision API
 */
async function callVisionAPI(
  apiKey: string,
  prompt: string,
  baselineImageUrl: string,
  completionImageUrl: string,
): Promise<{
  baseline_count: number
  completion_count: number
  meets_criteria: boolean
  confidence: number
  reasoning: string
}> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: baselineImageUrl, detail: 'high' },
            },
            {
              type: 'image_url',
              image_url: { url: completionImageUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('OpenAI API error', { status: response.status, error: errorText })
    throw createApiError(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      `Vision API request failed: ${response.status}`,
    )
  }

  const data = (await response.json()) as {
    choices: Array<{
      message: { content: string }
    }>
  }

  const content = data.choices[0]?.message?.content
  if (!content) {
    throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'Empty response from Vision API')
  }

  // Parse JSON response (handle potential markdown code blocks)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    return JSON.parse(jsonContent) as {
      baseline_count: number
      completion_count: number
      meets_criteria: boolean
      confidence: number
      reasoning: string
    }
  } catch {
    logger.error('Failed to parse Vision API response', { content })
    throw createApiError(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      'Invalid response format from Vision API',
    )
  }
}

/**
 * POST /api/ai/vision-verify
 *
 * Verifies image evidence by comparing baseline and completion images.
 * Called by CRE nodes during image-verification workflow.
 *
 * @example
 * ```json
 * POST /api/ai/vision-verify
 * {
 *   "baseline_image_url": "https://gateway.ipfs.io/ipfs/Qm...",
 *   "completion_image_url": "https://gateway.ipfs.io/ipfs/Qm...",
 *   "verification_criteria": {
 *     "target_text": "chainlink",
 *     "baseline_count": 1,
 *     "required_count": 20
 *   },
 *   "campaign_id": "uuid",
 *   "request_id": "uuid"
 * }
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    // Read raw body for signature verification
    const rawBody = (await readRawBody(event)) || ''

    // Check if this is a CRE callback (has signature header) or admin request
    const creSignature = getHeader(event, 'x-cre-signature')
    const walletAddress = event.context.auth?.address || getHeader(event, 'x-wallet-address')

    if (creSignature) {
      // Verify CRE webhook signature
      await verifyCREWebhook(event, rawBody)
    } else if (walletAddress && typeof walletAddress === 'string') {
      // Check if caller is admin
      if (!isAdminAddress(event, walletAddress)) {
        throw createApiError(
          ApiErrorCode.FORBIDDEN,
          'Admin access required for direct vision-verify calls',
        )
      }
    } else {
      throw createApiError(
        ApiErrorCode.UNAUTHORIZED,
        'Missing authentication: CRE signature or admin wallet required',
      )
    }

    // Parse and validate request body
    const input = visionVerifyRequestSchema.parse(JSON.parse(rawBody))

    // Get OpenAI API key from runtime config
    const config = useRuntimeConfig(event)
    const openaiApiKey = config.openaiApiKey as string

    if (!openaiApiKey) {
      throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'OpenAI API key not configured')
    }

    // Build prompt and call Vision API
    const prompt = buildVisionPrompt(input.verification_criteria)
    const visionResult = await callVisionAPI(
      openaiApiKey,
      prompt,
      input.baseline_image_url,
      input.completion_image_url,
    )

    // Calculate score for CRE consensus (0.0-1.0)
    const score = visionResult.meets_criteria
      ? Math.min(1.0, visionResult.confidence)
      : Math.max(0.0, 1.0 - visionResult.confidence)

    const response: VisionVerifyResponse = {
      baseline_count: visionResult.baseline_count,
      completion_count: visionResult.completion_count,
      meets_criteria: visionResult.meets_criteria,
      confidence: visionResult.confidence,
      reasoning: visionResult.reasoning,
      score,
    }

    logger.info('Vision verification completed', {
      campaign_id: input.campaign_id,
      request_id: input.request_id,
      meets_criteria: visionResult.meets_criteria,
      score,
    })

    return {
      success: true,
      data: response,
    }
  } catch (error) {
    throw handleError(error)
  }
})
