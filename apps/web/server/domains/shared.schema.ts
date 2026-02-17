import { z } from 'zod'

// =============================================================================
// SHARED DOMAIN SCHEMAS
// Purpose: Common Zod primitives shared across all domain schemas.
// All domain-specific schema files re-export these to maintain their public API.
// =============================================================================

/**
 * Ethereum wallet address (0x-prefixed, 40 hex chars, lowercased)
 */
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address')
  .transform((val) => val.toLowerCase())

/**
 * Campaign UUID identifier
 */
export const campaignIdSchema = z.string().uuid('Invalid campaign ID format')

/**
 * Wei amount as a positive integer string (e.g., "1000000000000000000" for 1 ETH)
 */
export const weiAmountSchema = z.string().regex(/^\d+$/, 'Amount must be a positive integer string')

/**
 * Ethereum transaction hash (0x-prefixed, 64 hex chars)
 */
export const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash')

/**
 * Coerce a query-string value to an integer with a default.
 * Handles `undefined`, empty string `""`, and numeric strings.
 */
export const coerceNumber = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === '' ? defaultValue : Number(val)),
    z.number().int(),
  )
