import { defineEventHandler, readRawBody } from 'h3'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { sendSuccess } from '../../utils/response'
import { handleError } from '../../utils/errors'
import { storeConsensusResult, verifyCREWebhook } from '../../utils/cre'

const baselineSchema = z.object({
  request_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  baseline_summary: z.string().min(1),
  baseline_hash: z.string().min(1),
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
    const input = baselineSchema.parse(JSON.parse(rawBody))
    const promptHash =
      typeof input.signals?.prompt_hash === 'string' ? input.signals.prompt_hash : undefined

    const stored = await storeConsensusResult(event, {
      campaignId: input.campaign_id,
      requestId: input.request_id,
      resultId: randomUUID(),
      aiProvider: 'cre',
      modelVersion: input.model ?? null,
      result: 1,
      confidence: null,
      reasoning: input.baseline_summary,
      sources: '[]',
      rawResponse: JSON.stringify(input),
      verificationType: 'baseline',
      inputHash: promptHash ?? input.baseline_hash,
    })

    return sendSuccess(event, {
      stored: stored.stored,
      request_id: input.request_id,
      campaign_id: input.campaign_id,
      baseline_hash: input.baseline_hash,
    })
  } catch (error) {
    throw handleError(error)
  }
})
