// =============================================================================
// CURRENCY UTILITIES
// Purpose: Shared USDC amount formatting and parsing
// Convention: All Wei amounts are stored as strings (uint256 representation)
// USDC uses 6 decimals (1 USDC = 1,000,000 wei)
// =============================================================================

/**
 * USDC decimal precision
 */
const USDC_DECIMALS = 6
const USDC_MULTIPLIER = 10 ** USDC_DECIMALS

/**
 * Format a Wei amount string to a human-readable USD currency string.
 *
 * @param weiAmount - Amount in smallest USDC unit (6 decimals)
 * @param decimals - Number of decimal places to display (default: 2)
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatUsdcAmount('1000000') // "$1.00"
 * formatUsdcAmount('1234567890') // "$1,234.57"
 */
export function formatUsdcAmount(weiAmount: string, decimals = 2): string {
  const wei = BigInt(weiAmount || '0')
  const usdc = Number(wei) / USDC_MULTIPLIER
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(usdc)
}

/**
 * Parse a human-readable dollar amount string to a Wei string.
 *
 * @param amount - Human-readable amount (e.g., "1234.56" or "$1,234.56")
 * @returns Wei amount string
 *
 * @example
 * parseUsdcToWei('100')    // "100000000"
 * parseUsdcToWei('1.50')   // "1500000"
 * parseUsdcToWei('$1,234') // "1234000000"
 */
export function parseUsdcToWei(amount: string): string {
  const cleaned = amount.replace(/[^0-9.]/g, '')
  const num = Number.parseFloat(cleaned) || 0
  const wei = Math.floor(num * USDC_MULTIPLIER)
  return wei.toString()
}

/**
 * Convert a Wei amount to a plain number (for calculations).
 *
 * @param weiAmount - Amount in smallest USDC unit
 * @returns Number representation in USDC
 */
export function weiToUsdc(weiAmount: string): number {
  return Number(BigInt(weiAmount || '0')) / USDC_MULTIPLIER
}

/**
 * Convert a USDC number to a Wei string.
 *
 * @param usdc - Amount in USDC (e.g., 100.50)
 * @returns Wei amount string
 */
export function usdcToWei(usdc: number): string {
  return Math.floor(usdc * USDC_MULTIPLIER).toString()
}
