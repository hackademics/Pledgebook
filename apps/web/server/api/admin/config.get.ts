import { defineEventHandler } from 'h3'

/**
 * GET /api/admin/config
 * Returns public admin configuration (allowlist for client-side checking)
 */
export default defineEventHandler((event) => {
  const { adminWalletAllowlist } = useRuntimeConfig(event)

  // Parse and return the allowlist
  const allowlist = String(adminWalletAllowlist || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  return {
    success: true,
    data: {
      allowlist,
      configured: allowlist.length > 0,
    },
  }
})
