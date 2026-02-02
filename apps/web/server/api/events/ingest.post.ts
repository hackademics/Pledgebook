import { defineEventHandler, getHeader } from 'h3'
import { z } from 'zod'
import { useRuntimeConfig } from '#imports'
import { useCloudflareOptional } from '../../utils/cloudflare'
import { parseBody, sendSuccess } from '../../utils/response'
import { ApiErrorCode, createApiError, handleError } from '../../utils/errors'

const ingestSchema = z.object({
  event: z.string().min(1),
  chainId: z.number().int(),
  txHash: z.string().optional(),
  payload: z.record(z.unknown()),
  receivedAt: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const apiKey = getHeader(event, 'x-api-key')
    const { apiSecret } = useRuntimeConfig(event)

    if (!apiSecret || apiKey !== apiSecret) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid API key')
    }

    const body = await parseBody(event, ingestSchema)
    const cloudflare = useCloudflareOptional(event)

    if (cloudflare?.BLOCKCHAIN_EVENTS_QUEUE) {
      await cloudflare.BLOCKCHAIN_EVENTS_QUEUE.send({
        type: 'blockchain-event',
        payload: body,
        timestamp: Date.now(),
      })
    }

    return sendSuccess(event, { queued: Boolean(cloudflare?.BLOCKCHAIN_EVENTS_QUEUE) })
  } catch (error) {
    throw handleError(error)
  }
})
