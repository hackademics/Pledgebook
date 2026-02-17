import { defineEventHandler, getHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { isAdminAddress } from '../../utils/admin'

/**
 * GET /api/admin/config
 * Returns admin configuration
 *
 * For authenticated admins: returns the full allowlist
 * For unauthenticated requests: only returns whether the config is set
 *
 * This prevents exposing admin wallet addresses publicly while still
 * allowing legitimate admin checks.
 */
export default defineEventHandler((event) => {
  const { adminWalletAllowlist } = useRuntimeConfig(event)

  // Parse the allowlist
  const allowlist = String(adminWalletAllowlist || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

  // Check if caller is authenticated admin
  const walletAddress = event.context.auth?.address || getHeader(event, 'x-wallet-address')
  const isAdmin =
    typeof walletAddress === 'string' &&
    walletAddress.length > 0 &&
    isAdminAddress(event, walletAddress)

  // Only expose full allowlist to authenticated admins
  if (isAdmin) {
    return {
      success: true,
      data: {
        allowlist,
        configured: allowlist.length > 0,
      },
    }
  }

  // For non-admins, only return whether config is set (for client-side UX)
  // and whether the requesting wallet is an admin
  return {
    success: true,
    data: {
      configured: allowlist.length > 0,
      isAdmin: typeof walletAddress === 'string' && allowlist.includes(walletAddress.toLowerCase()),
    },
  }
})
