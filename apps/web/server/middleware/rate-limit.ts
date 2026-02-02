import { defineEventHandler, getRequestURL } from 'h3'
import { enforceRateLimit } from '../utils/rate-limit'

const DEFAULT_RATE_LIMIT = {
  keyPrefix: 'api',
  limit: 120,
  windowSeconds: 60,
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  if (event.method === 'OPTIONS') {
    return
  }

  await enforceRateLimit(event, DEFAULT_RATE_LIMIT)
})
