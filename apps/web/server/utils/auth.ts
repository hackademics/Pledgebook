import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { ApiErrorCode, createApiError } from './errors'
import { walletAddressSchema } from '../domains/users/user.schema'

/**
 * Require a valid wallet address from the request headers.
 */
export function requireWalletAddress(
  event: H3Event,
  headerName: string = 'x-wallet-address',
): string {
  const contextAddress = event.context.auth?.address
  const header = getHeader(event, headerName)
  const headerValue = typeof header === 'string' ? header : ''

  if (contextAddress) {
    if (headerValue && headerValue.toLowerCase() !== contextAddress.toLowerCase()) {
      throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Wallet address mismatch')
    }
    return contextAddress
  }

  if (!import.meta.dev) {
    throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing SIWE session')
  }

  if (!headerValue) {
    throw createApiError(ApiErrorCode.UNAUTHORIZED, 'Missing X-Wallet-Address header')
  }

  const result = walletAddressSchema.safeParse(headerValue)
  if (!result.success) {
    throw createApiError(ApiErrorCode.BAD_REQUEST, 'Invalid wallet address format')
  }

  return result.data
}
