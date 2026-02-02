import { defineEventHandler, setResponseHeader } from 'h3'

/**
 * Global security headers for all responses.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader(
    event,
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()',
  )
  setResponseHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin')
  setResponseHeader(event, 'Cross-Origin-Resource-Policy', 'same-site')
  setResponseHeader(event, 'X-DNS-Prefetch-Control', 'off')

  if (!import.meta.dev) {
    setResponseHeader(
      event,
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    )
  }
})
