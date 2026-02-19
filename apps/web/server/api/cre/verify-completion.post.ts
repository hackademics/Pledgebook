import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { useCloudflare } from '../../utils/cloudflare'
import { useRuntimeConfig } from '#imports'
import { handleError, createApiError, ApiErrorCode } from '../../utils/errors'
import { requireWalletAddress } from '../../utils/auth'
import { sendSuccess, parseBody } from '../../utils/response'
import { createLogger } from '../../utils/logger'
import { callVerifyAndRelease, type OracleResult } from '../../utils/oracle'
import type { VisionVerifyResponse } from '../ai/vision-verify.post'
import type { Address } from 'viem'

const logger = createLogger('verify-completion')

// =============================================================================
// POST /api/cre/verify-completion
// Purpose: Trigger vision AI verification for campaign completion
// Access: Campaign creator only
// =============================================================================

const verifyCompletionSchema = z.object({
  campaignId: z.string().uuid(),
})

type CampaignRow = {
  campaign_id: string
  creator_address: string
  prompt: string
  prompt_hash: string | null
  escrow_address: string | null
  baseline_evidence_id: string | null
  completion_evidence_id: string | null
}

type EvidenceRow = {
  evidence_id: string
  gateway_url: string
  verification_status: string
  verification_result: string | null
}

/**
 * Parse verification criteria from campaign prompt
 * Default values for demo: target="chainlink", baseline=1, required=20
 */
function parseVerificationCriteria(prompt: string): {
  target_text: string
  baseline_count: number
  required_count: number
} {
  // Try to extract target text from prompt (e.g., "write 'chainlink' 20 times")
  const targetMatch = prompt.match(/['"]([^'"]+)['"]/)
  const countMatch = prompt.match(/(\d+)\s*times?/i)

  return {
    target_text: targetMatch?.[1] ?? 'chainlink',
    baseline_count: 1,
    required_count: countMatch?.[1] ? Number.parseInt(countMatch[1], 10) : 20,
  }
}

/**
 * POST /api/cre/verify-completion
 *
 * Triggers vision AI verification for a campaign's completion evidence.
 * Compares baseline and completion images to verify pledge fulfillment.
 *
 * @requires Campaign creator authentication
 * @param campaignId - Campaign to verify
 * @returns Verification result with pass/fail verdict
 *
 * @example
 * ```json
 * POST /api/cre/verify-completion
 * X-Wallet-Address: 0x123...
 * { "campaignId": "uuid" }
 * ```
 */
export default defineEventHandler(async (event) => {
  try {
    const { DB } = useCloudflare(event)
    const config = useRuntimeConfig(event)

    const walletAddress = requireWalletAddress(event)
    const { campaignId } = await parseBody(event, verifyCompletionSchema)

    // Fetch campaign and verify ownership
    const campaign = await DB.prepare(
      `SELECT campaign_id, creator_address, prompt, prompt_hash, escrow_address, baseline_evidence_id, completion_evidence_id 
       FROM campaigns WHERE campaign_id = ?`,
    )
      .bind(campaignId)
      .first<CampaignRow>()

    if (!campaign) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Campaign not found')
    }

    if (campaign.creator_address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw createApiError(
        ApiErrorCode.FORBIDDEN,
        'Only the campaign creator can trigger verification',
      )
    }

    // Verify both baseline and completion evidence exist
    if (!campaign.baseline_evidence_id) {
      throw createApiError(ApiErrorCode.BAD_REQUEST, 'Campaign missing baseline evidence')
    }

    if (!campaign.completion_evidence_id) {
      throw createApiError(ApiErrorCode.BAD_REQUEST, 'Campaign missing completion evidence')
    }

    // Fetch both evidence records
    const [baselineEvidence, completionEvidence] = await Promise.all([
      DB.prepare(
        `SELECT evidence_id, gateway_url, verification_status, verification_result FROM evidence WHERE evidence_id = ?`,
      )
        .bind(campaign.baseline_evidence_id)
        .first<EvidenceRow>(),
      DB.prepare(
        `SELECT evidence_id, gateway_url, verification_status, verification_result FROM evidence WHERE evidence_id = ?`,
      )
        .bind(campaign.completion_evidence_id)
        .first<EvidenceRow>(),
    ])

    if (!baselineEvidence) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Baseline evidence not found')
    }

    if (!completionEvidence) {
      throw createApiError(ApiErrorCode.NOT_FOUND, 'Completion evidence not found')
    }

    // Parse verification criteria from prompt
    const criteria = parseVerificationCriteria(campaign.prompt)
    const requestId = randomUUID()

    logger.info('Starting vision verification', {
      campaign_id: campaignId,
      request_id: requestId,
      criteria,
    })

    // Update completion evidence to processing status
    await DB.prepare(`UPDATE evidence SET verification_status = 'processing' WHERE evidence_id = ?`)
      .bind(campaign.completion_evidence_id)
      .run()

    // Call vision-verify endpoint directly (simulating CRE for now)
    // In production, this would trigger the CRE workflow
    const openaiApiKey = config.openaiApiKey as string
    if (!openaiApiKey) {
      throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'OpenAI API key not configured')
    }

    const visionPayload = {
      baseline_image_url: baselineEvidence.gateway_url,
      completion_image_url: completionEvidence.gateway_url,
      verification_criteria: criteria,
      campaign_id: campaignId,
      request_id: requestId,
    }

    // Call vision API directly
    const visionResult = await callVisionVerify(openaiApiKey, visionPayload)

    // Determine verification status
    const verificationStatus = visionResult.meets_criteria ? 'verified' : 'rejected'
    const now = new Date().toISOString()

    // Update evidence with verification result
    await DB.prepare(
      `UPDATE evidence 
       SET verification_status = ?, 
           verification_result = ?,
           verified_at = ?
       WHERE evidence_id = ?`,
    )
      .bind(verificationStatus, JSON.stringify(visionResult), now, campaign.completion_evidence_id)
      .run()

    logger.info('Vision verification completed', {
      campaign_id: campaignId,
      request_id: requestId,
      status: verificationStatus,
      score: visionResult.score,
    })

    // ==========================================================================
    // PHASE 3: Oracle callback - finalize on-chain if escrow exists
    // ==========================================================================
    let oracleResult: OracleResult | null = null

    if (campaign.escrow_address && campaign.prompt_hash) {
      logger.info('Triggering oracle callback', {
        campaign_id: campaignId,
        escrow_address: campaign.escrow_address,
        verification_success: visionResult.meets_criteria,
      })

      try {
        oracleResult = await callVerifyAndRelease(
          campaign.escrow_address as Address,
          visionResult.meets_criteria,
          campaign.prompt_hash as `0x${string}`,
        )

        logger.info('Oracle callback completed', {
          campaign_id: campaignId,
          oracle_success: oracleResult.success,
          transaction_hash: oracleResult.transactionHash,
          skipped: oracleResult.skipped,
          skip_reason: oracleResult.skipReason,
          error: oracleResult.error,
        })

        // Update campaign status in DB based on oracle result
        if (oracleResult.success && !oracleResult.skipped) {
          const newStatus = visionResult.meets_criteria ? 'complete' : 'failed'
          await DB.prepare(
            `UPDATE campaigns SET status = ?, completed_at = ? WHERE campaign_id = ?`,
          )
            .bind(newStatus, now, campaignId)
            .run()
        }
      } catch (oracleError) {
        // Log but don't fail the verification - oracle can be retried
        logger.error('Oracle callback failed', {
          campaign_id: campaignId,
          error: oracleError instanceof Error ? oracleError.message : 'Unknown error',
        })
        oracleResult = {
          success: false,
          error: oracleError instanceof Error ? oracleError.message : 'Unknown error',
        }
      }
    } else {
      logger.info('Skipping oracle callback - no escrow address', {
        campaign_id: campaignId,
        has_escrow: !!campaign.escrow_address,
        has_prompt_hash: !!campaign.prompt_hash,
      })
    }

    return sendSuccess(event, {
      campaignId,
      requestId,
      verdict: visionResult.meets_criteria ? 'pass' : 'fail',
      verificationStatus,
      result: visionResult,
      oracle: oracleResult,
    })
  } catch (error) {
    throw handleError(error)
  }
})

/**
 * Call vision verification API directly
 * In production, this would be routed through CRE
 */
async function callVisionVerify(
  apiKey: string,
  payload: {
    baseline_image_url: string
    completion_image_url: string
    verification_criteria: {
      target_text: string
      baseline_count: number
      required_count: number
    }
    campaign_id: string
    request_id: string
  },
): Promise<VisionVerifyResponse> {
  // Build vision prompt
  const prompt = `You are an AI verifier for a pledge campaign. Your task is to compare two images and verify completion of a pledge.

BASELINE IMAGE: [Image 1]
This shows the initial state before the pledge was completed.

COMPLETION IMAGE: [Image 2]
This should show the completed pledge.

VERIFICATION CRITERIA:
- Target text: "${payload.verification_criteria.target_text}"
- Baseline should show approximately ${payload.verification_criteria.baseline_count} instance(s)
- Completion should show at least ${payload.verification_criteria.required_count} instances

INSTRUCTIONS:
1. Count the number of times "${payload.verification_criteria.target_text}" appears in the BASELINE image
2. Count the number of times "${payload.verification_criteria.target_text}" appears in the COMPLETION image
3. Verify the completion count meets or exceeds ${payload.verification_criteria.required_count}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "baseline_count": <number>,
  "completion_count": <number>,
  "meets_criteria": <boolean>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>"
}`

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
              image_url: { url: payload.baseline_image_url, detail: 'high' },
            },
            {
              type: 'image_url',
              image_url: { url: payload.completion_image_url, detail: 'high' },
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
    throw createApiError(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      `Vision API request failed: ${response.status} - ${errorText}`,
    )
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices[0]?.message?.content
  if (!content) {
    throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'Empty response from Vision API')
  }

  // Parse JSON response
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const visionResult = JSON.parse(jsonContent) as {
    baseline_count: number
    completion_count: number
    meets_criteria: boolean
    confidence: number
    reasoning: string
  }

  // Calculate score for consensus
  const score = visionResult.meets_criteria
    ? Math.min(1.0, visionResult.confidence)
    : Math.max(0.0, 1.0 - visionResult.confidence)

  return {
    ...visionResult,
    score,
  }
}
