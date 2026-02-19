import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSiwe } from './useSiwe'

// Mock siwe module
vi.mock('siwe', () => ({
  SiweMessage: vi.fn().mockImplementation((params) => ({
    ...params,
    prepareMessage: () => `Sign in to Pledgebook with address ${params.address}`,
  })),
}))

describe('useSiwe', () => {
  const originalFetch = globalThis.$fetch

  beforeEach(() => {
    globalThis.$fetch = vi.fn() as unknown as typeof $fetch
  })

  afterEach(() => {
    globalThis.$fetch = originalFetch
  })

  it('initializes with unauthenticated state', () => {
    const { isAuthenticated, sessionAddress, isAuthenticating, error } = useSiwe()
    expect(isAuthenticated.value).toBe(false)
    expect(sessionAddress.value).toBeNull()
    expect(isAuthenticating.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('checkSession returns false when no active session', async () => {
    ;(globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { authenticated: false, address: null },
    })

    const { checkSession, isAuthenticated } = useSiwe()
    const result = await checkSession()

    expect(result).toBe(false)
    expect(isAuthenticated.value).toBe(false)
  })

  it('checkSession returns true with valid session', async () => {
    ;(globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { authenticated: true, address: '0x1234567890abcdef1234567890abcdef12345678' },
    })

    const { checkSession, isAuthenticated, sessionAddress } = useSiwe()
    const result = await checkSession()

    expect(result).toBe(true)
    expect(isAuthenticated.value).toBe(true)
    expect(sessionAddress.value).toBe('0x1234567890abcdef1234567890abcdef12345678')
  })

  it('checkSession handles network errors gracefully', async () => {
    ;(globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    )

    const { checkSession, isAuthenticated } = useSiwe()
    const result = await checkSession()

    expect(result).toBe(false)
    expect(isAuthenticated.value).toBe(false)
  })

  it('signOut clears session address', async () => {
    ;(globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const { signOut, sessionAddress } = useSiwe()
    sessionAddress.value = '0x1234'

    await signOut()

    expect(sessionAddress.value).toBeNull()
  })

  it('signOut handles errors without throwing', async () => {
    ;(globalThis.$fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Logout failed'),
    )

    const { signOut, sessionAddress } = useSiwe()
    sessionAddress.value = '0x1234'

    // Should not throw
    await signOut()
    expect(sessionAddress.value).toBeNull()
  })
})
