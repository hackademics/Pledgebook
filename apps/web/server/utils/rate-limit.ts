import type { H3Event } from 'h3'
import { getHeader, getRequestIP } from 'h3'
import { useCloudflareOptional } from './cloudflare'
import { ApiErrorCode, createApiError } from './errors'
import { createLogger } from './logger'

const logger = createLogger('RateLimit')

export interface RateLimitOptions {
  keyPrefix: string
  limit: number
  windowSeconds: number
}

function resolveClientIp(event: H3Event): string {
  return (
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestIP(event) ||
    'unknown'
  )
}

export async function enforceRateLimit(event: H3Event, options: RateLimitOptions): Promise<void> {
  const cloudflare = useCloudflareOptional(event)
  const kv = cloudflare?.RATE_LIMITS
  if (!kv) {
    // In production, log a warning if rate limiting is unavailable
    if (!import.meta.dev) {
      logger.warn('Rate limiting KV not available - requests are not rate limited')
    }
    return
  }

  const ip = resolveClientIp(event)
  const bucket = Math.floor(Date.now() / (options.windowSeconds * 1000))
  const key = `${options.keyPrefix}:${ip}:${bucket}`

  const current = Number(await kv.get(key)) || 0
  if (current >= options.limit) {
    throw createApiError(ApiErrorCode.RATE_LIMITED, 'Rate limit exceeded')
  }

  await kv.put(key, String(current + 1), {
    expirationTtl: options.windowSeconds + 5,
  })
}
