import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getHeader } from 'h3'
import { ApiErrorCode, createApiError } from './errors'
import { walletAddressSchema } from '../domains/users/user.schema'

/**
 * Parses the admin wallet allowlist from runtime config.
 * Returns an array of lowercased wallet addresses.
 */
function parseAllowlist(allowlistStr: string | undefined): string[] {
  return String(allowlistStr || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Check if a wallet address is in the admin allowlist.
 */
export function isAdminAddress(event: H3Event, address: string): boolean {
  const { adminWalletAllowlist } = useRuntimeConfig(event)
  const allowlist = parseAllowlist(adminWalletAllowlist as string | undefined)
  return allowlist.includes(address.toLowerCase())
}

/**
 * Require that the caller is an admin wallet.
 * Throws FORBIDDEN if not an admin.
 */
export function requireAdmin(event: H3Event): string {
  const contextAddress = event.context.auth?.address
  const header = getHeader(event, 'x-wallet-address')
  const raw = contextAddress || (typeof header === 'string' ? header : '')

  if (!raw) {
    throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing wallet address')
  }

  const result = walletAddressSchema.safeParse(raw)
  if (!result.success) {
    throw createApiError(ApiErrorCode.BAD_REQUEST, 'Invalid wallet address format')
  }

  const { adminWalletAllowlist } = useRuntimeConfig(event)
  const allowlist = parseAllowlist(adminWalletAllowlist as string | undefined)

  if (allowlist.length === 0) {
    throw createApiError(ApiErrorCode.SERVICE_UNAVAILABLE, 'Admin allowlist not configured')
  }

  if (!allowlist.includes(result.data.toLowerCase())) {
    throw createApiError(ApiErrorCode.FORBIDDEN, 'Admin access required')
  }

  return result.data
}
