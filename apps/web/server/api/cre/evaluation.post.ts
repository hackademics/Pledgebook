import { defineEventHandler, readRawBody } from 'h3'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { sendSuccess } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { storeConsensusResult, verifyCREWebhook } from '../../utils/cre'

const evaluationSchema = z.object({
  request_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  verdict: z.enum(['pass', 'fail', 'needs_review']),
  confidence: z.number().min(0).max(1),
  evaluation_summary: z.string().min(1),
  consensus: z.number().min(0).max(1).optional(),
  signals: z.record(z.unknown()).optional(),
  model: z.string().optional(),
  created_at: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Read raw body for signature verification
    const rawBody = (await readRawBody(event)) || ''

    // Verify CRE webhook signature
    await verifyCREWebhook(event, rawBody)

    // Parse and validate input
    const input = evaluationSchema.parse(JSON.parse(rawBody))
    const promptHash =
      typeof input.signals?.prompt_hash === 'string' ? input.signals.prompt_hash : undefined

    const result = input.verdict === 'pass' ? 1 : 0

    const stored = await storeConsensusResult(event, {
      campaignId: input.campaign_id,
      requestId: input.request_id,
      resultId: randomUUID(),
      aiProvider: 'cre',
      modelVersion: input.model ?? null,
      result,
      confidence: input.confidence,
      reasoning: input.evaluation_summary,
      sources: '[]',
      rawResponse: JSON.stringify(input),
      verificationType: 'completion',
      inputHash: promptHash ?? null,
    })

    return sendSuccess(event, {
      stored: stored.stored,
      request_id: input.request_id,
      campaign_id: input.campaign_id,
    })
  } catch (error) {
    throw handleError(error)
  }
})
