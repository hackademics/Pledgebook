import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { useCloudflareOptional } from './cloudflare'
import { ApiErrorCode, createApiError } from './errors'
import { createLogger } from './logger'

const logger = createLogger('CRE')

/**
 * Verify that a CRE webhook request is authentic.
 * Checks for a valid HMAC signature in the X-CRE-Signature header.
 *
 * @param event - H3 event
 * @param body - Raw request body string
 * @throws ApiError if verification fails
 */
export async function verifyCREWebhook(event: H3Event, body: string): Promise<void> {
  const signature = getHeader(event, 'x-cre-signature')
  const timestamp = getHeader(event, 'x-cre-timestamp')

  if (!signature) {
    throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing CRE signature header')
  }

  if (!timestamp) {
    throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing CRE timestamp header')
  }

  // Check timestamp is within 5 minutes to prevent replay attacks
  const timestampMs = Number(timestamp)
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000
  if (Number.isNaN(timestampMs) || Math.abs(now - timestampMs) > fiveMinutes) {
    throw createApiError(ApiErrorCode.FORBIDDEN, 'CRE webhook timestamp expired or invalid')
  }

  const { creWebhookSecret } = useRuntimeConfig(event)
  if (!creWebhookSecret) {
    // In development, allow bypass if secret not configured
    if (import.meta.dev) {
      logger.warn('Webhook secret not configured, skipping verification in dev mode')
      return
    }
    throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'CRE webhook secret not configured')
  }

  // Compute expected signature: HMAC-SHA256(timestamp + '.' + body)
  const payload = `${timestamp}.${body}`
  const expectedSignature = createHmac('sha256', creWebhookSecret as string)
    .update(payload)
    .digest('hex')

  // Timing-safe comparison
  try {
    const sigBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      throw createApiError(ApiErrorCode.FORBIDDEN, 'Invalid CRE webhook signature')
    }
  } catch {
    throw createApiError(ApiErrorCode.FORBIDDEN, 'Invalid CRE webhook signature')
  }
}

export type ConsensusInsert = {
  campaignId: string
  requestId?: string
  resultId: string
  aiProvider: string
  modelVersion?: string | null
  result: number
  confidence?: number | null
  reasoning?: string | null
  sources?: string | null
  rawResponse?: string | null
  verificationType: 'baseline' | 'progress' | 'completion' | 'dispute'
  inputHash?: string | null
}

export async function storeConsensusResult(event: H3Event, record: ConsensusInsert) {
  const cloudflare = useCloudflareOptional(event)
  if (!cloudflare) {
    return { stored: false, reason: 'cloudflare-bindings-missing' }
  }

  const { DB } = cloudflare
  const now = new Date().toISOString()

  await DB.prepare(
    `
      INSERT INTO consensus_results (
        result_id,
        campaign_id,
        round_number,
        ai_provider,
        model_version,
        result,
        confidence,
        reasoning,
        sources,
        raw_response,
        verification_type,
        input_hash,
        created_at,
        verified_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      record.resultId,
      record.campaignId,
      1,
      record.aiProvider,
      record.modelVersion ?? null,
      record.result,
      record.confidence ?? null,
      record.reasoning ?? null,
      record.sources ?? '[]',
      record.rawResponse ?? null,
      record.verificationType,
      record.inputHash ?? null,
      now,
      now,
    )
    .run()

  await DB.prepare(
    `
      INSERT INTO audit_log (
        actor_type,
        action,
        action_category,
        entity_type,
        entity_id,
        details,
        status,
        request_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  )
    .bind(
      'system',
      'cre_callback',
      'consensus',
      'campaign',
      record.campaignId,
      JSON.stringify({
        verification_type: record.verificationType,
        result: record.result,
        confidence: record.confidence ?? null,
      }),
      'success',
      record.requestId ?? null,
      now,
    )
    .run()

  return { stored: true }
}
