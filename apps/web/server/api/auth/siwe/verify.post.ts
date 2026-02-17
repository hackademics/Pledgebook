import { defineEventHandler, getCookie, setCookie } from 'h3'
import { SiweMessage } from 'siwe'
import { z } from 'zod'
import { useRuntimeConfig } from '#imports'
import { parseBody, sendSuccess } from '../../../utils/response'
import { createApiError, ApiErrorCode, handleError } from '../../../utils/errors'
import { SIWE_NONCE_COOKIE, SIWE_TOKEN_COOKIE, signSiweSession } from '../../../utils/siwe'

const verifySchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
})

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export default defineEventHandler(async (event) => {
  try {
    const body = await parseBody(event, verifySchema)
    const nonce = getCookie(event, SIWE_NONCE_COOKIE)

    if (!nonce) {
      throw createApiError(ApiErrorCode.BAD_REQUEST, 'Missing SIWE nonce')
    }

    const config = useRuntimeConfig(event)
    const publicAppUrl = config.public?.appUrl || ''
    const serverAppUrl = config.appUrl || ''

    // SECURITY: Never derive expected domain from request headers (attacker-controlled).
    // If no trusted appUrl is configured, reject in production.
    const expectedOrigin = publicAppUrl || serverAppUrl
    if (!expectedOrigin && !import.meta.dev) {
      throw createApiError(
        ApiErrorCode.SERVICE_UNAVAILABLE,
        'Application URL not configured — cannot verify SIWE domain',
      )
    }
    const expectedDomain = expectedOrigin ? new URL(expectedOrigin).host : ''

    const message = new SiweMessage(body.message)
    const nowIso = new Date().toISOString()
    const verification = await message.verify({
      signature: body.signature,
      nonce,
      domain: expectedDomain || undefined,
      time: nowIso,
    })

    if (!verification.success) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid SIWE signature')
    }

    if (expectedDomain && message.domain !== expectedDomain) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid SIWE domain')
    }

    if (message.uri && expectedOrigin && !message.uri.startsWith(expectedOrigin)) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Invalid SIWE URI')
    }

    if (message.expirationTime && new Date(message.expirationTime).getTime() <= Date.now()) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'SIWE message expired')
    }

    if (message.notBefore && new Date(message.notBefore).getTime() > Date.now()) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'SIWE message not active yet')
    }

    const token = await signSiweSession(event, message.address)

    setCookie(event, SIWE_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    })

    setCookie(event, SIWE_NONCE_COOKIE, '', {
      httpOnly: true,
      secure: !import.meta.dev,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return sendSuccess(event, {
      address: message.address,
      token,
    })
  } catch (error) {
    throw handleError(error)
  }
})
