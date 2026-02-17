import { defineEventHandler, getRequestURL } from 'h3'
import { enforceRateLimit } from '../utils/rate-limit'

const DEFAULT_RATE_LIMIT = {
  keyPrefix: 'api',
  limit: 120,
  windowSeconds: 60,
}

/** Stricter limits for expensive AI endpoints */
const AI_RATE_LIMIT = {
  keyPrefix: 'api:ai',
  limit: 15,
  windowSeconds: 60,
}

/** Stricter limits for auth endpoints to prevent brute-force */
const AUTH_RATE_LIMIT = {
  keyPrefix: 'api:auth',
  limit: 30,
  windowSeconds: 60,
}

/** Very strict limits for nonce requests to prevent replay attacks */
const NONCE_RATE_LIMIT = {
  keyPrefix: 'api:auth:nonce',
  limit: 10,
  windowSeconds: 60,
}

/** Stricter limits for file upload endpoints */
const UPLOAD_RATE_LIMIT = {
  keyPrefix: 'api:upload',
  limit: 10,
  windowSeconds: 60,
}

function resolveRateLimit(pathname: string) {
  if (pathname.startsWith('/api/ai/')) return AI_RATE_LIMIT
  if (pathname === '/api/auth/siwe/nonce') return NONCE_RATE_LIMIT
  if (pathname.startsWith('/api/auth/')) return AUTH_RATE_LIMIT
  if (pathname.startsWith('/api/upload/')) return UPLOAD_RATE_LIMIT
  return DEFAULT_RATE_LIMIT
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  if (event.method === 'OPTIONS') {
    return
  }

  const rateLimit = resolveRateLimit(url.pathname)
  await enforceRateLimit(event, rateLimit)
})
