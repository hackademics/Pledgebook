import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { ApiErrorCode, createApiError } from './errors'

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function requireTurnstile(event: H3Event): Promise<void> {
  const token = getHeader(event, 'x-turnstile-token')
  if (!token) {
    throw createApiError(ApiErrorCode.BAD_REQUEST, 'Missing Turnstile token')
  }

  const { turnstileSecret, turnstileSecretLocal } = useRuntimeConfig(event)
  const host = (getHeader(event, 'host') || '').toLowerCase()
  const isLocalhost =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')
  const resolvedSecret =
    import.meta.dev && isLocalhost
      ? turnstileSecretLocal || turnstileSecret || '1x0000000000000000000000000000000AA'
      : turnstileSecret

  if (!resolvedSecret) {
    if (import.meta.dev) {
      return
    }
    throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'Turnstile secret not configured')
  }

  const body = new URLSearchParams({
    secret: resolvedSecret,
    response: token,
  })

  const ip = getHeader(event, 'cf-connecting-ip') || getHeader(event, 'x-forwarded-for')
  if (ip) {
    body.append('remoteip', ip.split(',')[0].trim())
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })

  const data = (await response.json()) as TurnstileResponse
  if (!data.success) {
    throw createApiError(ApiErrorCode.FORBIDDEN, 'Turnstile verification failed', {
      errors: data['error-codes'] || [],
    })
  }
}
